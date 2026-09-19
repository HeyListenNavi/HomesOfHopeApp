
import React from "react";
import { Modal, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import { Badge } from "@/components/ui/badge";

export interface ScanPageModalProps {
    visible: boolean;
    pageCount: number;
    lastImageUri: string | null;
    onScanAnother: () => void;
    onFinish: () => void;
    onDiscardLast?: () => void;
    onCancelAll?: () => void;
    isGenerating?: boolean;
}

const ScanPageModal = ({
    visible,
    pageCount,
    lastImageUri,
    onScanAnother,
    onFinish,
    onDiscardLast,
    onCancelAll,
    isGenerating = false,
}: ScanPageModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancelAll || onFinish}
        >
            <View className="flex-1 bg-black/60 items-center justify-center p-5">
                <View className="bg-white w-full max-w-sm rounded-3xl p-6 gap-5 shadow-2xl shadow-black/20">
                    {}
                    <View className="items-center gap-1.5 pt-1">
                        <FluentEmoji emoji="📄" className="text-4xl mb-1" />
                        <Text className="font-bold text-gray-800 text-2xl text-center leading-tight">
                            Página {pageCount} Agregada
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                            <Badge className="bg-primary/10 border-transparent px-3 py-1 rounded-full">
                                <Text className="text-primary text-sm font-bold">
                                    {pageCount} {pageCount === 1 ? "página lista" : "páginas listas"}
                                </Text>
                            </Badge>
                        </View>
                    </View>

                    {}
                    {lastImageUri ? (
                        <View className="h-[50vh] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 items-center justify-center">
                            <Image
                                source={{ uri: lastImageUri }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="contain"
                                transition={200}
                            />
                        </View>
                    ) : null}

                    {}
                    <View className="gap-2.5 pt-1">
                        <TouchableOpacity
                            onPress={onFinish}
                            disabled={isGenerating}
                            className="bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                            accessibilityRole="button"
                            accessibilityLabel="Finalizar y Crear PDF"
                        >
                            {isGenerating ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <>
                                    <Boxicon name="bxs-check-circle" size={22} color="#ffffff" />
                                    <Text className="text-white font-bold text-base">
                                        Finalizar y Crear PDF
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onScanAnother}
                            disabled={isGenerating}
                            className="bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-gray-200"
                            accessibilityRole="button"
                            accessibilityLabel="Escanear otra página"
                        >
                            <Boxicon name="bxs-camera" size={22} color="#4b5563" />
                            <Text className="text-gray-700 font-bold text-base">
                                Escanear Otra Página
                            </Text>
                        </TouchableOpacity>

                        {onDiscardLast && (
                            <TouchableOpacity
                                onPress={onDiscardLast}
                                disabled={isGenerating}
                                className="py-2.5 flex-row items-center justify-center gap-1.5 active:opacity-70"
                                accessibilityRole="button"
                                accessibilityLabel="Descartar última foto"
                            >
                                <Boxicon name="bxs-trash" size={18} color="#ef4444" />
                                <Text className="text-red-500 font-semibold text-sm">
                                    Descartar última foto
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ScanPageModal;
