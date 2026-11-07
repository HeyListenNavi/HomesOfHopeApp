import { useState } from "react";
import { Alert, ToastAndroid } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import { File } from "expo-file-system";
import {
    DOCUMENT_MAX_BYTES,
    MAX_SCANNED_PDF_PAGES,
    formatBytesToMB,
    getFileSizeBytes,
    safeDeleteTempFile,
} from "@/lib/mediaCompression";
import { useFileCompression } from "@/hooks/useFileCompression";

interface UsePdfScannerProps {
    onPdfGenerated: (file: { name: string; uri: string; size?: number }) => void;
}

export function usePdfScanner({ onPdfGenerated }: UsePdfScannerProps) {
    const [scannedImages, setScannedImages] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { compressImage, isCompressing } = useFileCompression();

    const capturePage = async (currentCount = scannedImages.length) => {
        if (currentCount >= MAX_SCANNED_PDF_PAGES) {
            Alert.alert(
                "Límite de páginas alcanzado",
                `Un documento escaneado puede tener como máximo ${MAX_SCANNED_PDF_PAGES} páginas.`
            );
            if (currentCount > 0) {
                setModalVisible(true);
            }
            return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            ToastAndroid.show("Permiso de cámara denegado", ToastAndroid.SHORT);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.85,
        });

        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            const compressed = await compressImage({
                uri: asset.uri,
                fileName: asset.fileName,
                fileSize: asset.fileSize,
                maxBytes: DOCUMENT_MAX_BYTES,
                maxDimension: 1200,
                quality: 0.6,
            });

            if (compressed) {
                try {
                    const base64Data = await new File(compressed.uri).base64();
                    safeDeleteTempFile(compressed.uri);
                    const base64Uri = `data:image/jpeg;base64,${base64Data}`;
                    setScannedImages((prev) => [...prev, base64Uri]);
                    setModalVisible(true);
                } catch {
                    safeDeleteTempFile(compressed.uri);
                    ToastAndroid.show("Error al procesar la página escaneada", ToastAndroid.SHORT);
                }
            } else if (currentCount > 0) {
                setModalVisible(true);
            }
        } else {
            setScannedImages((prev) => {
                if (prev.length > 0) {
                    setModalVisible(true);
                }
                return prev;
            });
        }
    };

    const startScan = async () => {
        setScannedImages([]);
        await capturePage(0);
    };

    const scanAnother = async () => {
        if (scannedImages.length >= MAX_SCANNED_PDF_PAGES) {
            Alert.alert(
                "Límite de páginas alcanzado",
                `Se permite un máximo de ${MAX_SCANNED_PDF_PAGES} páginas por PDF escaneado.`
            );
            return;
        }
        setModalVisible(false);
        const nextCount = scannedImages.length;
        setTimeout(() => capturePage(nextCount), 250);
    };

    const discardLast = () => {
        setScannedImages((prev) => {
            const updated = prev.slice(0, -1);
            if (updated.length === 0) {
                setModalVisible(false);
            }
            return updated;
        });
    };

    const cancelAll = () => {
        setModalVisible(false);
        setScannedImages([]);
    };

    const finishScan = async () => {
        if (scannedImages.length === 0) {
            setModalVisible(false);
            return;
        }

        setIsGenerating(true);
        try {
            const htmlPages = scannedImages
                .map(
                    (uri) => `
                <div style="page-break-after: always; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
                    <img src="${uri}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>
            `
                )
                .join("");

            const html = `
                <html>
                    <body style="margin: 0; padding: 0;">
                        ${htmlPages}
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            const pdfSize = getFileSizeBytes(uri);
            if (pdfSize > DOCUMENT_MAX_BYTES) {
                safeDeleteTempFile(uri);
                Alert.alert(
                    "PDF demasiado pesado",
                    `El PDF generado (${formatBytesToMB(pdfSize)}) supera el límite máximo permitido de ${formatBytesToMB(DOCUMENT_MAX_BYTES)}. Descarta algunas páginas e intenta de nuevo.`
                );
                return;
            }

            onPdfGenerated({
                name: `Documento_Escaneado_${Date.now()}.pdf`,
                uri,
                size: pdfSize,
            });
            setModalVisible(false);
            setScannedImages([]);
            ToastAndroid.show("PDF generado correctamente ✅", ToastAndroid.SHORT);
        } catch {
            ToastAndroid.show("Error al crear PDF", ToastAndroid.SHORT);
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        startScan,
        scanAnother,
        discardLast,
        cancelAll,
        finishScan,
        modalVisible,
        pageCount: scannedImages.length,
        lastImageUri: scannedImages[scannedImages.length - 1] ?? null,
        isGenerating: isGenerating || isCompressing,
    };
}
