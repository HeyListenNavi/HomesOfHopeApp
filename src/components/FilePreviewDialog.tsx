import { useState } from "react";
import { ActivityIndicator, Linking, Modal, Pressable, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import React from "react";
import Pdf from "react-native-pdf";
import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/authStore";

interface FilePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: { name: string; uri: string; mimeType?: string | null } | null;
}

const FilePreviewDialog = ({ open, onOpenChange, file }: FilePreviewDialogProps) => {
    const token = useAuthStore.getState().token;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const name = file?.name ?? "";
    const uri = file?.uri ?? "";
    const mimeType = file?.mimeType ?? "";

    const isImage = mimeType.startsWith("image/") || name.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i) != null;
    const isPdf = mimeType === "application/pdf" || name.match(/\.pdf(\?|$)/i) != null;

    const headers: Record<string, string> = {};
    if (uri.startsWith("http") && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const handleClose = () => {
        setLoading(true);
        setError(false);
        onOpenChange(false);
    };

    return (
        <Modal
            visible={open}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-2">
                <Pressable className="absolute inset-0" onPress={handleClose} />

                <View className="w-[95%] max-w-md bg-white rounded-3xl overflow-hidden">
                    <View className="px-5 pt-5 pb-3">
                        <Text className="text-lg text-primary font-bold text-center" numberOfLines={1}>
                            {name}
                        </Text>
                    </View>

                    <View style={{ height: 480 }}>
                        {isImage ? (
                            <Image
                                source={{ uri, headers }}
                                style={{ flex: 1, width: "100%", height: "100%" }}
                                contentFit="contain"
                                transition={200}
                            />
                        ) : isPdf ? (
                            <View className="flex-1 bg-gray-100">
                                {loading && !error && (
                                    <View className="absolute inset-0 items-center justify-center z-10">
                                        <ActivityIndicator size="small" color="#61b346" />
                                    </View>
                                )}
                                {error ? (
                                    <View className="flex-1 items-center justify-center px-6 gap-3">
                                        <Text className="text-gray-500 text-center">
                                            No se pudo previsualizar el PDF.
                                        </Text>
                                        <TouchableOpacity
                                            className="bg-primary/10 px-4 py-2 rounded-full flex-row items-center gap-1 active:opacity-70"
                                            onPress={() => Linking.openURL(uri)}
                                            accessibilityRole="button"
                                        >
                                            <Boxicon name="bx-globe" size={16} color="#61b346" />
                                            <Text className="text-primary font-semibold text-sm">
                                                Abrir en navegador
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Pdf
                                        source={{ uri, headers }}
                                        style={{ flex: 1 }}
                                        trustAllCerts={false}
                                        onLoadComplete={() => setLoading(false)}
                                        onError={() => {
                                            setLoading(false);
                                            setError(true);
                                        }}
                                    />
                                )}
                            </View>
                        ) : (
                            <View className="flex-1 items-center justify-center px-6 gap-3">
                                <Boxicon name="bxs-file" size={40} color="#d1d5db" />
                                <Text className="text-gray-500 text-center">
                                    Este tipo de archivo no se puede previsualizar en la app.
                                </Text>
                                <TouchableOpacity
                                    className="bg-gray-100 px-4 py-2 rounded-full flex-row items-center gap-1 active:opacity-70"
                                    onPress={() => Linking.openURL(uri)}
                                    accessibilityRole="button"
                                >
                                    <Boxicon name="bx-globe" size={16} color="#4b5563" />
                                    <Text className="text-gray-600 font-semibold text-sm">
                                        Abrir en navegador
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View className="p-4">
                        <TouchableOpacity className="p-4 rounded-xl bg-gray-100 w-full items-center" onPress={handleClose}>
                            <Text className="text-gray-500 font-semibold">
                                Cerrar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default FilePreviewDialog;