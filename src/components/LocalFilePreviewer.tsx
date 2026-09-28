import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import React from "react";
import Pdf from "react-native-pdf";
import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";

interface LocalFilePreviewerProps {
    file: { name: string; uri: string };
    onRemove: () => void;
    containerClassName?: string;
}

const LocalFilePreviewer = ({ file, onRemove, containerClassName = "flex-row items-center gap-3 bg-gray-50 rounded-2xl pl-4 pr-2 py-2 border border-gray-100 mt-1" }: LocalFilePreviewerProps) => {
    const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i) != null || file.uri.startsWith('data:image') || !file.name.match(/\.[a-zA-Z]+$/);
    const [open, setOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(true);
    const [pdfError, setPdfError] = useState(false);

    const handleClose = () => {
        setPdfLoading(true);
        setPdfError(false);
        setOpen(false);
    };

    return (
        <View className={containerClassName}>
            <TouchableOpacity className="flex-1 flex-row items-center gap-3" activeOpacity={0.7} onPress={() => setOpen(true)}>
                <View className="h-10 w-10 bg-primary/10 rounded-xl items-center justify-center shrink-0">
                    <Boxicon name="bxs-file" size={20} color="#61b346" />
                </View>
                <Text
                    className="flex-1 font-medium text-gray-700 text-base"
                    numberOfLines={1}
                >
                    {file.name}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onRemove}
                className="p-2 active:opacity-60"
                accessibilityRole="button"
                accessibilityLabel="Quitar archivo"
            >
                <Boxicon name="bxs-trash" size={20} color="#ef4444" />
            </TouchableOpacity>

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
                                {file.name}
                            </Text>
                        </View>

                        <View style={{ height: 480 }}>
                            {isImage ? (
                                <Image
                                    source={{ uri: file.uri }}
                                    style={{ flex: 1, width: "100%", height: "100%" }}
                                    contentFit="contain"
                                    transition={200}
                                />
                            ) : (
                                <View className="flex-1 bg-gray-100">
                                    {pdfLoading && !pdfError && (
                                        <View className="absolute inset-0 items-center justify-center z-10">
                                            <ActivityIndicator size="small" color="#61b346" />
                                        </View>
                                    )}
                                    {pdfError ? (
                                        <View className="flex-1 items-center justify-center px-6">
                                            <Text className="text-gray-500 text-center">
                                                No se pudo previsualizar el PDF.
                                            </Text>
                                        </View>
                                    ) : (
                                        <Pdf
                                            source={{ uri: file.uri }}
                                            style={{ flex: 1 }}
                                            trustAllCerts={false}
                                            onLoadComplete={() => setPdfLoading(false)}
                                            onError={() => {
                                                setPdfLoading(false);
                                                setPdfError(true);
                                            }}
                                        />
                                    )}
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
        </View>
    );
};

export default LocalFilePreviewer;