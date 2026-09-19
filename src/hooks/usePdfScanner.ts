import { useState } from "react";
import { ToastAndroid } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";

interface UsePdfScannerProps {
    onPdfGenerated: (file: { name: string; uri: string }) => void;
}

export function usePdfScanner({ onPdfGenerated }: UsePdfScannerProps) {
    const [scannedImages, setScannedImages] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const capturePage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            ToastAndroid.show("Permiso de cámara denegado", ToastAndroid.SHORT);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.6,
            base64: true,
        });

        if (!result.canceled) {
            const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setScannedImages((prev) => [...prev, base64Uri]);
            setModalVisible(true);
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
        await capturePage();
    };

    const scanAnother = async () => {
        setModalVisible(false);
        setTimeout(capturePage, 250);
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

            onPdfGenerated({
                name: `Documento_Escaneado_${Date.now()}.pdf`,
                uri,
            });
            setModalVisible(false);
            setScannedImages([]);
            ToastAndroid.show("PDF generado correctamente ✅", ToastAndroid.SHORT);
        } catch (e) {
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
        isGenerating,
    };
}
