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
                quality: 0.7,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
                    Alert.alert(
                        "Archivo muy pesado",
                        `La foto seleccionada (${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB) supera el límite máximo permitido de 10 MB.`
                    );
                    return;
                }
                setFile({
                    name: asset.fileName ?? `foto_${Date.now()}.jpg`,
                    uri: asset.uri,
                    mimeType: asset.mimeType ?? "image/jpeg",
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
                videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
                videoMaxDuration: 180,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
                    Alert.alert(
                        "Archivo muy pesado",
                        `El video grabado (${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB) supera el límite máximo permitido de 10 MB. Intenta grabar un video más corto.`
                    );
                    return;
                }
                setFile({
                    name: asset.fileName ?? `video_${Date.now()}.mp4`,
                    uri: asset.uri,
                    mimeType: asset.mimeType ?? "video/mp4",
                });
            }
        } catch {
            Alert.alert("Error", "No se pudo grabar el video.");
        }
    };

    const chooseFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsEditing: false,
                quality: 0.7,
                videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
                    Alert.alert(
                        "Archivo muy pesado",
                        `El archivo seleccionado (${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB) supera el límite máximo permitido de 10 MB.`
                    );
                    return;
                }
                const isVideoAsset = asset.type === "video" || asset.mimeType?.startsWith("video/");
                const defaultName = isVideoAsset ? `video_${Date.now()}.mp4` : `imagen_${Date.now()}.jpg`;
                const defaultMime = isVideoAsset ? "video/mp4" : "image/jpeg";

                setFile({
                    name: asset.fileName ?? defaultName,
                    uri: asset.uri,
                    mimeType: asset.mimeType ?? defaultMime,
                });
            }
        } catch {
            Alert.alert("Error", "No se pudo seleccionar el archivo de la galería.");
        }
    };

    const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; 

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*", "video/*"],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];

                if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
                    Alert.alert(
                        "Archivo muy pesado",
                        `El archivo seleccionado (${(asset.size / (1024 * 1024)).toFixed(1)} MB) supera el límite máximo permitido de 50 MB. Por favor selecciona o comprime el archivo.`
                    );
                    return;
                }

                let detectedMime = asset.mimeType;
                if (!detectedMime) {
                    const lowerName = asset.name.toLowerCase();
                    if (lowerName.endsWith(".pdf")) detectedMime = "application/pdf";
                    else if (/\.(mp4|mov|webm|m4v|3gp|mkv)$/.test(lowerName)) detectedMime = "video/mp4";
                    else detectedMime = "image/jpeg";
                }

                setFile({
                    name: asset.name,
                    uri: asset.uri,
                    mimeType: detectedMime,
                });
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

                        {file ? (
                            <LocalFilePreviewer
                                file={file}
                                onRemove={() => setFile(null)}
                            />
                        ) : (
                            <View className="flex-row gap-3">
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
                        disabled={isLoading}
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
                        subtitle: "Graba un video corto (hasta 3 min)",
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
                        label: "Elegir de la Galería",
                        subtitle: "Selecciona fotos o videos guardados",
                        icon: "bxs-image",
                        color: "#6366f1",
                        iconBgColor: "bg-indigo-100",
                        badge: "Fotos y Videos",
                        badgeBgColor: "bg-indigo-100",
                        badgeTextColor: "text-indigo-700",
                        onPress: chooseFromGallery,
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