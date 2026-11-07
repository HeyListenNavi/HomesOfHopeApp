import React, { useState, useRef } from "react";
import { View, TouchableOpacity, ActivityIndicator, ToastAndroid, Alert } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Text } from "@/components/ui/text";
import { useNavigation, useLocalSearchParams } from "expo-router";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useScreenTopPadding } from "@/lib/layout";
import LocalFilePreviewer from "@/components/LocalFilePreviewer";
import OptionsSheet from "@/components/OptionsSheet";
import ScanPageModal from "@/components/ScanPageModal";
import { usePdfScanner } from "@/hooks/usePdfScanner";
import { useFileCompression } from "@/hooks/useFileCompression";
import { DOCUMENT_MAX_BYTES, MAX_VIDEO_DURATION_SECONDS } from "@/lib/mediaCompression";
import Boxicon from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import { useDocumentStore, getFamilyProfileShowQueryKey, getFamilyMemberShowQueryKey } from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";
import { DOCUMENT, toOptions } from "@/lib/enums";

interface PickedFile {
    name: string;
    uri: string;
    mimeType?: string;
}

const Page = () => {
    const navigation = useNavigation();
    const { id, documentable_type } = useLocalSearchParams<{ id: string; documentable_type?: string }>();
    const topPadding = useScreenTopPadding();
    const queryClient = useQueryClient();
    const storeDocument = useDocumentStore();

    const [file, setFile] = useState<PickedFile | null>(null);
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const photoSheetRef = useRef<BottomSheetModal>(null);
    const documentSheetRef = useRef<BottomSheetModal>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { compressImage, compressVideo, validatePdf, isCompressing, progress } = useFileCompression();

    const targetId = Number(id);
    const targetType = documentable_type || "family_profile";

    const takePhotoWithCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso requerido", "Se requiere acceso a la cámara para tomar una foto.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                await compressImage({
                    uri: asset.uri,
                    fileName: asset.fileName ?? `foto_${Date.now()}.jpg`,
                    fileSize: asset.fileSize,
                    maxBytes: DOCUMENT_MAX_BYTES,
                    onSuccess: (compressed) =>
                        setFile({
                            name: compressed.name,
                            uri: compressed.uri,
                            mimeType: compressed.mimeType,
                        }),
                });
            }
        } catch {
            Alert.alert("Error", "No se pudo tomar la foto.");
        }
    };

    const recordVideoWithCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso requerido", "Se requiere acceso a la cámara para grabar un video.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['videos'],
                allowsEditing: false,
                videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
                videoMaxDuration: MAX_VIDEO_DURATION_SECONDS,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                await compressVideo({
                    uri: asset.uri,
                    fileName: asset.fileName ?? `video_${Date.now()}.mp4`,
                    fileSize: asset.fileSize,
                    durationMs: asset.duration,
                    maxBytes: DOCUMENT_MAX_BYTES,
                    maxDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
                    onSuccess: (compressed) =>
                        setFile({
                            name: compressed.name,
                            uri: compressed.uri,
                            mimeType: compressed.mimeType,
                        }),
                });
            }
        } catch {
            Alert.alert("Error", "No se pudo grabar el video.");
        }
    };

    const chooseFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                await compressImage({
                    uri: asset.uri,
                    fileName: asset.fileName ?? `imagen_${Date.now()}.jpg`,
                    fileSize: asset.fileSize,
                    maxBytes: DOCUMENT_MAX_BYTES,
                    onSuccess: (compressed) =>
                        setFile({
                            name: compressed.name,
                            uri: compressed.uri,
                            mimeType: compressed.mimeType,
                        }),
                });
            }
        } catch {
            Alert.alert("Error", "No se pudo seleccionar la imagen de la galería.");
        }
    };

    const chooseVideoFromGallery = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["video/*"],
                copyToCacheDirectory: false,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                await compressVideo({
                    uri: asset.uri,
                    fileName: asset.name ?? `video_${Date.now()}.mp4`,
                    fileSize: asset.size,
                    maxBytes: DOCUMENT_MAX_BYTES,
                    maxDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
                    onSuccess: (compressed) =>
                        setFile({
                            name: compressed.name,
                            uri: compressed.uri,
                            mimeType: compressed.mimeType,
                        }),
                });
            }
        } catch {
            Alert.alert("Error", "No se pudo seleccionar el video.");
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*", "video/*"],
                copyToCacheDirectory: false,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const lowerName = asset.name.toLowerCase();
                const isPdf = asset.mimeType === "application/pdf" || lowerName.endsWith(".pdf");
                const isVideo =
                    asset.mimeType?.startsWith("video/") ||
                    /\.(mp4|mov|webm|m4v|3gp|mkv)$/.test(lowerName);

                const applyProcessed = (processed: { name: string; uri: string; mimeType: string }) => {
                    setFile({
                        name: processed.name,
                        uri: processed.uri,
                        mimeType: processed.mimeType,
                    });
                };

                if (isPdf) {
                    await validatePdf({
                        uri: asset.uri,
                        fileName: asset.name,
                        fileSize: asset.size,
                        maxBytes: DOCUMENT_MAX_BYTES,
                        onSuccess: applyProcessed,
                    });
                } else if (isVideo) {
                    await compressVideo({
                        uri: asset.uri,
                        fileName: asset.name,
                        fileSize: asset.size,
                        maxBytes: DOCUMENT_MAX_BYTES,
                        maxDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
                        onSuccess: applyProcessed,
                    });
                } else {
                    await compressImage({
                        uri: asset.uri,
                        fileName: asset.name,
                        fileSize: asset.size,
                        maxBytes: DOCUMENT_MAX_BYTES,
                        onSuccess: applyProcessed,
                    });
                }
            }
        } catch {
            Alert.alert("Error", "No se pudo seleccionar el documento.");
        }
    };

    const pdfScanner = usePdfScanner({
        onPdfGenerated: (scannedFile) => setFile({
            ...scannedFile,
            mimeType: "application/pdf",
        }),
    });

    const handleSubmit = async () => {
        if (!type) {
            ToastAndroid.show("Selecciona el tipo de documento", ToastAndroid.SHORT);
            return;
        }
        if (!file) {
            ToastAndroid.show("Adjunta un archivo o una foto", ToastAndroid.SHORT);
            return;
        }

        setIsLoading(true);
        try {
            const fileName = file.name || "document";
            const mimeType = file.mimeType || "application/octet-stream";

            await storeDocument.mutateAsync({
                data: {
                    documentable_id: targetId,
                    documentable_type: targetType,
                    document_type: type,
                    file: {
                        uri: file.uri,
                        type: mimeType,
                        name: fileName,
                    } as any,
                },
            });

            if (targetType === "family_profile") {
                queryClient.invalidateQueries({ queryKey: getFamilyProfileShowQueryKey(targetId) });
            } else if (targetType === "family_member") {
                queryClient.invalidateQueries({ queryKey: getFamilyMemberShowQueryKey(targetId) });
            }

            ToastAndroid.show("Documento subido exitosamente ✅", ToastAndroid.SHORT);
            navigation.goBack();
        } catch (error: any) {
            const errorData = error?.response?.data;
            let errorMsg = "Ocurrió un error al procesar el archivo. Intenta de nuevo.";

            const rawMsg = errorData?.errors?.file?.[0] || errorData?.message || "";
            if (rawMsg === "validation.max.file" || rawMsg.includes("max")) {
                errorMsg = "El archivo excede el tamaño máximo permitido por el servidor (10 MB). Por favor comprime o elige un archivo más ligero.";
            } else if (rawMsg) {
                errorMsg = rawMsg;
            }

            Alert.alert("Error al subir documento", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-100">
            <KeyboardAwareScrollView
                contentContainerClassName="px-6 pt-2 pb-32 gap-6"
                contentContainerStyle={{ paddingTop: topPadding }}
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                    <View className="flex-row items-center gap-2">
                        <FluentEmoji emoji="📄" className="text-2xl" />
                        <Text className="text-gray-800 font-bold text-xl">
                            Nuevo Documento
                        </Text>
                    </View>

                    <Select
                        label="Tipo de Documento"
                        placeholder="Seleccionar tipo..."
                        iconName="bxs-file"
                        options={toOptions(DOCUMENT)}
                        value={type}
                        onValueChange={setType}
                    />

                    <Textarea
                        label="Descripción"
                        iconName="bxs-note"
                        placeholder="Notas adicionales sobre este documento..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <View className="gap-2">
                        <Text className="text-sm font-medium text-gray-500">
                            Archivo
                        </Text>

                        {isCompressing ? (
                            <View
                                key="doc-compressing"
                                className="bg-primary/5 border border-primary/20 rounded-2xl p-5 items-center justify-center gap-2"
                            >
                                <ActivityIndicator size="small" color="#61b346" />
                                <Text className="text-gray-700 font-bold text-sm">
                                    {progress > 0 && progress < 100
                                        ? `Comprimiendo archivo... ${progress}%`
                                        : "Procesando y comprimiendo archivo..."}
                                </Text>
                            </View>
                        ) : file ? (
                            <LocalFilePreviewer
                                key="doc-preview"
                                file={file}
                                onRemove={() => setFile(null)}
                            />
                        ) : (
                            <View key="doc-actions" className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => photoSheetRef.current?.present()}
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 items-center gap-2 active:bg-gray-100 shadow-sm shadow-black/5"
                                    accessibilityRole="button"
                                    accessibilityLabel="Abrir cámara para tomar foto o grabar video"
                                >
                                    <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center">
                                        <Boxicon name="bxs-camera" size={24} color="#61b346" />
                                    </View>
                                    <Text className="text-gray-700 font-bold text-sm">
                                        Cámara
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => documentSheetRef.current?.present()}
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 items-center gap-2 active:bg-gray-100 shadow-sm shadow-black/5"
                                    accessibilityRole="button"
                                    accessibilityLabel="Seleccionar archivo o galería del dispositivo"
                                >
                                    <View className="h-12 w-12 rounded-xl bg-blue-100 items-center justify-center">
                                        <Boxicon name="bxs-file" size={24} color="#2563eb" />
                                    </View>
                                    <Text className="text-gray-700 font-bold text-sm">
                                        Archivo
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading || isCompressing}
                        className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                        accessibilityRole="button"
                        accessibilityLabel="Subir documento"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <Boxicon name="bxs-check-circle" size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-base">
                                    Subir Documento
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>

            <OptionsSheet
                ref={photoSheetRef}
                emoji="📷"
                title="Usar Cámara"
                subtitle="Elige si deseas capturar foto o video"
                options={[
                    {
                        label: "Tomar Foto",
                        subtitle: "Captura una imagen con la cámara",
                        icon: "bxs-camera",
                        color: "#61b346",
                        iconBgColor: "bg-primary/10",
                        badge: "Foto",
                        badgeBgColor: "bg-primary/10",
                        badgeTextColor: "text-primary",
                        onPress: takePhotoWithCamera,
                    },
                    {
                        label: "Grabar Video",
                        subtitle: "Graba un video corto (hasta 5 min)",
                        icon: "bxs-video-plus",
                        color: "#dc2626",
                        iconBgColor: "bg-red-100",
                        badge: "Video",
                        badgeBgColor: "bg-red-100",
                        badgeTextColor: "text-red-700",
                        onPress: recordVideoWithCamera,
                    },
                ]}
            />
            <OptionsSheet
                ref={documentSheetRef}
                emoji="📁"
                title="Agregar Archivo"
                subtitle="Selecciona el origen del archivo"
                options={[
                    {
                        label: "Elegir Foto de la Galería",
                        subtitle: "Selecciona una imagen guardada",
                        icon: "bxs-image",
                        color: "#6366f1",
                        iconBgColor: "bg-indigo-100",
                        badge: "Fotos",
                        badgeBgColor: "bg-indigo-100",
                        badgeTextColor: "text-indigo-700",
                        onPress: chooseFromGallery,
                    },
                    {
                        label: "Elegir Video",
                        subtitle: "Selecciona un video (máx. 5 min)",
                        icon: "bxs-video",
                        color: "#dc2626",
                        iconBgColor: "bg-red-100",
                        badge: "Video",
                        badgeBgColor: "bg-red-100",
                        badgeTextColor: "text-red-700",
                        onPress: chooseVideoFromGallery,
                    },
                    {
                        label: "Subir Archivo",
                        subtitle: "Documentos PDF, imágenes o videos",
                        icon: "bxs-file",
                        color: "#2563eb",
                        iconBgColor: "bg-blue-100",
                        badge: "Dispositivo",
                        badgeBgColor: "bg-blue-100",
                        badgeTextColor: "text-blue-700",
                        onPress: pickDocument,
                    },
                    {
                        label: "Escanear a PDF",
                        subtitle: "Captura varias páginas y crea un PDF",
                        icon: "bxs-scan",
                        color: "#9333ea",
                        iconBgColor: "bg-purple-100",
                        badge: "Multi-página",
                        badgeBgColor: "bg-purple-100",
                        badgeTextColor: "text-purple-700",
                        onPress: pdfScanner.startScan,
                    },
                ]}
            />

            <ScanPageModal
                visible={pdfScanner.modalVisible}
                pageCount={pdfScanner.pageCount}
                lastImageUri={pdfScanner.lastImageUri}
                onScanAnother={pdfScanner.scanAnother}
                onFinish={pdfScanner.finishScan}
                onDiscardLast={pdfScanner.discardLast}
                onCancelAll={pdfScanner.cancelAll}
                isGenerating={pdfScanner.isGenerating}
            />
        </View>
    );
};

export default Page;
