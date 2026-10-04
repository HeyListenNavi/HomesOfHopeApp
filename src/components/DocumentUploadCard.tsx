import React, { useState, useRef } from "react";
import { Image } from "expo-image";
import {
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import OptionsSheet, { SheetOption } from "@/components/OptionsSheet";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import SectionHeader from "@/components/SectionHeader";
import { usePdfScanner } from "@/hooks/usePdfScanner";
import ScanPageModal from "@/components/ScanPageModal";

export interface UploadedFileAsset {
    uri: string;
    name?: string;
    mimeType?: string;
    size?: number;
}

export interface DocumentUploadCardProps {
    title: string;
    description?: string;
    emoji?: string;
    badge?: "optional" | "required" | string;
    value?: UploadedFileAsset | string | null;
    onChange: (file: UploadedFileAsset | null) => void;
    icon?: BoxIconName | string;
    buttonText?: string;
    secondaryButtonText?: string;
    onSecondaryUpload?: (file: UploadedFileAsset | null) => void;
    error?: string;
    className?: string;
    mode?: "photo" | "document" | "mixed";
}

const DocumentUploadCard = ({
    title,
    description,
    emoji,
    badge = "optional",
    value,
    onChange,
    icon = "bxs-file",
    buttonText = "Toca para subir archivo",
    secondaryButtonText,
    onSecondaryUpload,
    error,
    className,
    mode = "mixed",
}: DocumentUploadCardProps) => {
    const optionsSheetRef = useRef<BottomSheetModal>(null);
    const [targetType, setTargetType] = useState<"primary" | "secondary">("primary");
    const [isLoading, setIsLoading] = useState(false);

    
    const {
        startScan,
        scanAnother,
        discardLast,
        cancelAll,
        finishScan,
        modalVisible: scanModalVisible,
        pageCount: scanPageCount,
        lastImageUri: scanLastImageUri,
        isGenerating: isGeneratingPdf,
    } = usePdfScanner({
        onPdfGenerated: (file) => {
            const uploadedAsset: UploadedFileAsset = {
                uri: file.uri,
                name: file.name,
                mimeType: "application/pdf",
            };
            if (targetType === "secondary" && onSecondaryUpload) {
                onSecondaryUpload(uploadedAsset);
            } else {
                onChange(uploadedAsset);
            }
        },
    });

    const isUploaded = Boolean(value);
    const fileUri = typeof value === "string" ? value : value?.uri;
    const fileName = typeof value === "string" ? "Documento cargado" : value?.name || "Archivo adjunto";
    const isImage = fileUri?.match(/\.(jpg|jpeg|png|webp|heic)$/i) || fileUri?.startsWith("data:image");

    const handleOpenPicker = (type: "primary" | "secondary" = "primary") => {
        setTargetType(type);
        optionsSheetRef.current?.present();
    };

    const handleCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso Denegado", "Se requiere permiso para usar la cámara.");
                return;
            }
            setIsLoading(true);
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.85,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const file: UploadedFileAsset = {
                    uri: asset.uri,
                    name: asset.fileName || `foto_${Date.now()}.jpg`,
                    mimeType: asset.mimeType || "image/jpeg",
                    size: asset.fileSize,
                };
                if (targetType === "secondary" && onSecondaryUpload) {
                    onSecondaryUpload(file);
                } else {
                    onChange(file);
                }
            }
        } catch {
            Alert.alert("Error", "No se pudo tomar la foto");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGallery = async () => {
        try {
            setIsLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                quality: 0.85,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const file: UploadedFileAsset = {
                    uri: asset.uri,
                    name: asset.fileName || `imagen_${Date.now()}.jpg`,
                    mimeType: asset.mimeType || "image/jpeg",
                    size: asset.fileSize,
                };
                if (targetType === "secondary" && onSecondaryUpload) {
                    onSecondaryUpload(file);
                } else {
                    onChange(file);
                }
            }
        } catch {
            Alert.alert("Error", "No se pudo seleccionar la imagen");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocument = async () => {
        try {
            setIsLoading(true);
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const file: UploadedFileAsset = {
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType || "application/pdf",
                    size: asset.size,
                };
                if (targetType === "secondary" && onSecondaryUpload) {
                    onSecondaryUpload(file);
                } else {
                    onChange(file);
                }
            }
        } catch {
            Alert.alert("Error", "No se pudo seleccionar el documento");
        } finally {
            setIsLoading(false);
        }
    };

    const pickerOptions: SheetOption[] = (() => {
        const options: SheetOption[] = [];
        if (mode === "mixed" || mode === "document") {
            options.push({
                label: "Escanear Documento (PDF)",
                subtitle: "Toma varias páginas y crea un archivo PDF",
                icon: "bxs-file",
                color: "#61b346",
                iconBgColor: "bg-primary/10",
                onPress: startScan,
            });
        }
        options.push({
            label: "Tomar Fotografía",
            subtitle: "Cámara rápida de tu dispositivo",
            icon: "bxs-camera",
            color: "#2563eb",
            iconBgColor: "bg-blue-100",
            onPress: handleCamera,
        });
        options.push({
            label: "Galería de Fotos",
            subtitle: "Seleccionar una imagen guardada",
            icon: "bxs-image",
            color: "#8b5cf6",
            iconBgColor: "bg-purple-100",
            onPress: handleGallery,
        });
        if (mode === "mixed" || mode === "document") {
            options.push({
                label: "Archivo o Documento PDF",
                subtitle: "Explorar tus archivos locales",
                icon: "bxs-file",
                color: "#d97706",
                iconBgColor: "bg-amber-100",
                onPress: handleDocument,
            });
        }
        return options;
    })();

    return (
        <View className={className || "bg-white p-6 rounded-3xl shadow-md shadow-black/5 gap-4"}>
            {}
            <SectionHeader
                emoji={emoji}
                title={title}
                description={description}
                badge={
                    badge ? (
                        <Badge
                            className={`border-transparent px-3 py-1 rounded-full ${
                                badge === "required"
                                    ? "bg-red-100"
                                    : "bg-gray-100"
                            }`}
                        >
                            <Text
                                className={`text-xs font-bold ${
                                    badge === "required" ? "text-red-700" : "text-gray-500"
                                }`}
                            >
                                {badge === "required" ? "Requerido" : badge === "optional" ? "Opcional" : badge}
                            </Text>
                        </Badge>
                    ) : undefined
                }
            />

            {}
            {isUploaded ? (
                <View className="bg-gray-50 border border-gray-200 p-4 rounded-2xl gap-3.5">
                    <View className="flex-row items-center gap-3.5">
                        {isImage && fileUri ? (
                            <Image
                                source={{ uri: fileUri }}
                                style={{ width: 64, height: 64, borderRadius: 16 }}
                                contentFit="cover"
                                transition={200}
                            />
                        ) : (
                            <View className="h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center shrink-0 border border-primary/20">
                                <Boxicon name="bxs-file" size={30} color="#61b346" />
                            </View>
                        )}
                        <View className="flex-1 gap-1">
                            <View className="flex-row items-center gap-2">
                                <View className="bg-emerald-100 px-2.5 py-0.5 rounded-full flex-row items-center gap-1">
                                    <Boxicon name="bxs-check-circle" size={14} color="#15803d" />
                                    <Text className="text-emerald-800 font-bold text-xs">
                                        Cargado
                                    </Text>
                                </View>
                            </View>
                            <Text
                                className="text-gray-900 font-bold text-base leading-snug"
                                numberOfLines={1}
                            >
                                {fileName}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-end gap-2 border-t border-gray-200 pt-3">
                        <TouchableOpacity
                            onPress={() => onChange(null)}
                            activeOpacity={0.7}
                            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 flex-row items-center gap-2 active:bg-gray-100"
                            accessibilityRole="button"
                            accessibilityLabel="Quitar o cambiar documento"
                        >
                            <Boxicon name="bxs-trash" size={16} color="#ef4444" />
                            <Text className="text-gray-700 font-bold text-sm">
                                Quitar o cambiar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                
                <View className="gap-3">
                    <TouchableOpacity
                        onPress={() => handleOpenPicker("primary")}
                        activeOpacity={0.85}
                        className="bg-gray-50 border border-gray-200 p-6 rounded-2xl items-center justify-center gap-2.5 active:bg-gray-100"
                    >
                        <View className="h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center">
                            <Boxicon name={icon as any} size={32} color="#61b346" />
                        </View>
                        <Text className="text-gray-800 font-bold text-lg text-center">
                            {buttonText}
                        </Text>
                        <Text className="text-gray-500 text-sm font-medium">
                            Cámara, Galería o PDF
                        </Text>
                    </TouchableOpacity>

                    {secondaryButtonText && (
                        <>
                            <View className="items-center py-0.5">
                                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    o también
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleOpenPicker("secondary")}
                                activeOpacity={0.85}
                                className="bg-amber-50 p-4 rounded-2xl border border-amber-200 items-center justify-center gap-2 active:bg-amber-100"
                            >
                                <View className="h-12 w-12 rounded-xl bg-amber-100 items-center justify-center">
                                    <Boxicon name="bxs-file" size={24} color="#d97706" />
                                </View>
                                <Text className="text-amber-950 font-bold text-base text-center">
                                    {secondaryButtonText}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            {isLoading && (
                <View className="flex-row items-center justify-center gap-2 py-2">
                    <ActivityIndicator size="small" color="#61b346" />
                    <Text className="text-gray-500 text-sm font-medium">Cargando archivo...</Text>
                </View>
            )}

            {error && (
                <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-2xl mt-0.5">
                    <FluentEmoji emoji="⚠️" className="text-lg" />
                    <Text className="text-red-700 font-bold text-sm flex-1">
                        {error}
                    </Text>
                </View>
            )}

            {}
            <OptionsSheet
                ref={optionsSheetRef}
                title="Seleccionar Origen"
                subtitle="Elige cómo deseas subir este documento"
                emoji="📁"
                options={pickerOptions}
            />

            {}
            <ScanPageModal
                visible={scanModalVisible}
                pageCount={scanPageCount}
                lastImageUri={scanLastImageUri}
                onScanAnother={scanAnother}
                onFinish={finishScan}
                onDiscardLast={discardLast}
                onCancelAll={cancelAll}
                isGenerating={isGeneratingPdf}
            />
        </View>
    );
};

export default DocumentUploadCard;
