import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, ToastAndroid, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { useNavigation, useLocalSearchParams } from "expo-router";
import Textarea from "@/components/Textarea";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useScreenTopPadding } from "@/lib/layout";
import { Checkbox } from "@/components/ui/checkbox";
import Boxicon from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import { useNoteStore, getNoteIndexQueryKey } from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";

const Page = () => {
    const navigation = useNavigation();
    const { id, noteable_type } = useLocalSearchParams<{ id: string; noteable_type?: string }>();
    const topPadding = useScreenTopPadding();
    const queryClient = useQueryClient();
    const storeNote = useNoteStore();

    const [content, setContent] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const targetId = Number(id);
    const targetType = noteable_type || "family_profile";

    const handleSubmit = async () => {
        if (!content.trim()) {
            ToastAndroid.show("Escribe el contenido de la nota", ToastAndroid.SHORT);
            return;
        }

        if (isNaN(targetId) || targetId <= 0) {
            Alert.alert("Error", "No se pudo identificar la entidad asociada a esta nota.");
            return;
        }

        setIsLoading(true);
        try {
            await storeNote.mutateAsync({
                data: {
                    noteable_id: targetId,
                    noteable_type: targetType,
                    content: content.trim(),
                    is_private: isPrivate,
                },
            });

            queryClient.invalidateQueries({
                queryKey: getNoteIndexQueryKey({ noteable_type: targetType, noteable_id: targetId }),
            });

            ToastAndroid.show("Nota guardada exitosamente ✅", ToastAndroid.SHORT);
            navigation.goBack();
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMsg =
                errorData?.message ||
                "Ocurrió un error al guardar la nota. Intenta de nuevo.";
            Alert.alert("Error al guardar nota", errorMsg);
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
                        <FluentEmoji emoji="📝" className="text-2xl" />
                        <Text className="text-gray-800 font-bold text-xl">
                            Nueva Nota
                        </Text>
                    </View>

                    <Textarea
                        label="Contenido"
                        iconName="bxs-note"
                        placeholder="Escribe la nota..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                    />

                    <TouchableOpacity
                        onPress={() => setIsPrivate((prev) => !prev)}
                        className="flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-4 active:bg-gray-200"
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isPrivate }}
                        accessibilityLabel="Marcar nota como privada"
                    >
                        <Checkbox
                            checked={isPrivate}
                            onCheckedChange={(checked) => setIsPrivate(!!checked)}
                            aria-label="Nota privada"
                        />
                        <Text className="flex-1 font-medium text-gray-700 text-base">
                            Nota privada
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-md shadow-primary/30 active:opacity-90"
                        accessibilityRole="button"
                        accessibilityLabel="Guardar nota"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <Boxicon name="bxs-check-circle" size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-base">
                                    Guardar Nota
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default Page;