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
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") return;
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            const asset = result.assets[0];
            setFile({
                name: asset.fileName ?? `foto_${Date.now()}.jpg`,
                uri: asset.uri,
                mimeType: asset.mimeType ?? "image/jpeg",
            });
        }
    };

    const chooseFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            const asset = result.assets[0];
            setFile({
                name: asset.fileName ?? `imagen_${Date.now()}.jpg`,
                uri: asset.uri,
                mimeType: asset.mimeType ?? "image/jpeg",
            });
        }
    };

    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; 

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];

                if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
                    Alert.alert(
                        "Archivo muy pesado",
                        `El archivo seleccionado (${(asset.size / (1024 * 1024)).toFixed(1)} MB) supera el límite máximo permitido de 10 MB. Por favor selecciona o comprime el archivo.`
                    );
                    return;
                }

                setFile({
                    name: asset.name,
                    uri: asset.uri,
                    mimeType: asset.mimeType ?? (asset.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
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

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => photoSheetRef.current?.present()}
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 items-center gap-2 active:bg-gray-100 shadow-sm shadow-black/5"
                                accessibilityRole="button"
                                accessibilityLabel="Tomar foto o elegir de la galería"
                            >
                                <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center">
                                    <Boxicon name="bxs-camera" size={24} color="#61b346" />
                                </View>
                                <Text className="text-gray-700 font-bold text-sm">
                                    Foto
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => documentSheetRef.current?.present()}
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 items-center gap-2 active:bg-gray-100 shadow-sm shadow-black/5"
                                accessibilityRole="button"
                                accessibilityLabel="Seleccionar archivo del dispositivo"
                            >
                                <View className="h-12 w-12 rounded-xl bg-blue-100 items-center justify-center">
                                    <Boxicon name="bxs-file" size={24} color="#2563eb" />
                                </View>
                                <Text className="text-gray-700 font-bold text-sm">
                                    Archivo
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {file && (
                            <LocalFilePreviewer
                                file={file}
                                onRemove={() => setFile(null)}
                            />
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
                title="Agregar Fotografía"
                options={[
                    {
                        label: "Tomar Foto",
                        icon: "bxs-camera",
                        color: "#61b346",
                        iconBgColor: "bg-primary/10",
                        badge: "Cámara",
                        badgeBgColor: "bg-primary/10",
                        badgeTextColor: "text-primary",
                        onPress: takePhotoWithCamera,
                    },
                    {
                        label: "Elegir de la Galería",
                        icon: "bxs-image",
                        color: "#2563eb",
                        iconBgColor: "bg-blue-100",
                        badge: "Galería",
                        badgeBgColor: "bg-blue-100",
                        badgeTextColor: "text-blue-700",
                        onPress: chooseFromGallery,
                    },
                ]}
            />
            <OptionsSheet
                ref={documentSheetRef}
                emoji="📄"
                title="Agregar Archivo"
                options={[
                    {
                        label: "Subir Archivo",
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