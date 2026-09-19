import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, ToastAndroid, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { useNavigation, useLocalSearchParams } from "expo-router";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import DatePickerInput from "@/components/DatePickerInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as DocumentPicker from "expo-document-picker";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useScreenTopPadding } from "@/lib/layout";
import AudioPlayer from "@/components/AudioPlayer";
import Boxicon from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import { useTestimonyStore, getTestimonyIndexQueryKey } from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";

const Page = () => {
    const navigation = useNavigation();
    const { id: familyId } = useLocalSearchParams<{ id: string }>();
    const topPadding = useScreenTopPadding();
    const queryClient = useQueryClient();
    const storeTestimony = useTestimonyStore();

    const audio = useVoiceRecorder();
    const [summary, setSummary] = useState("");
    const [language, setLanguage] = useState<"es" | "en">("es");
    const [recordedAt, setRecordedAt] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [pickedFileName, setPickedFileName] = useState<string | null>(null);
    const [pickedMimeType, setPickedMimeType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const pickAudio = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/m4a", "audio/*"],
            copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setPickedFileName(asset.name);
            setPickedMimeType(asset.mimeType ?? "audio/mpeg");
            audio.setRecordedUri(asset.uri);
        }
    };

    const handleDiscard = () => {
        audio.discardRecording();
        setPickedFileName(null);
        setPickedMimeType(null);
    };

    const handleSubmit = async () => {
        const targetFamilyId = Number(familyId);
        if (isNaN(targetFamilyId) || targetFamilyId <= 0) {
            Alert.alert("Error", "No se pudo identificar la familia asociada a este testimonio.");
            return;
        }

        if (!audio.recordedUri) {
            ToastAndroid.show("Graba o adjunta un audio", ToastAndroid.SHORT);
            return;
        }
        if (!summary.trim()) {
            ToastAndroid.show("Escribe la descripción del testimonio", ToastAndroid.SHORT);
            return;
        }

        setIsLoading(true);
        try {
            const uri = audio.recordedUri;
            let fileName = pickedFileName || uri.split("/").pop() || `testimonio_${Date.now()}.m4a`;
            if (!fileName.includes(".")) {
                fileName += ".m4a";
            }

            let mimeType = pickedMimeType;
            if (!mimeType) {
                const lower = fileName.toLowerCase();
                if (lower.endsWith(".mp3")) mimeType = "audio/mpeg";
                else if (lower.endsWith(".wav")) mimeType = "audio/wav";
                else if (lower.endsWith(".mp4")) mimeType = "audio/mp4";
                else if (lower.endsWith(".aac")) mimeType = "audio/aac";
                else mimeType = "audio/m4a";
            }

            await storeTestimony.mutateAsync({
                data: {
                    family_profile_id: targetFamilyId,
                    language: language,
                    summary: summary.trim(),
                    recorded_at: recordedAt,
                    audio: {
                        uri,
                        type: mimeType,
                        name: fileName,
                    } as any,
                },
            });

            queryClient.invalidateQueries({
                queryKey: getTestimonyIndexQueryKey({ family_profile_id: targetFamilyId }),
            });

            ToastAndroid.show("Testimonio guardado exitosamente ✅", ToastAndroid.SHORT);
            navigation.goBack();
        } catch (error: any) {
            console.error("Testimony upload error:", error, error?.response?.data);
            const errorData = error?.response?.data;
            const errorMsg =
                errorData?.errors?.audio?.[0] ||
                errorData?.message ||
                error?.message ||
                "Ocurrió un error al guardar el testimonio. Intenta de nuevo.";
            Alert.alert("Error al guardar testimonio", typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
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
                        <FluentEmoji emoji="🎤" className="text-2xl" />
                        <Text className="text-gray-800 font-bold text-xl">
                            Nuevo Testimonio
                        </Text>
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-medium text-gray-500">
                            Audio
                        </Text>

                        {audio.isRecording ? (
                            <View className="bg-red-50 rounded-2xl p-4 gap-3 border border-red-100">
                                <View className="flex-row items-center justify-center gap-3">
                                    <ActivityIndicator color="#ef4444" />
                                    <Text className="text-red-600 font-bold text-base">
                                        Grabando... {audio.duration}s
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={audio.stopRecording}
                                    className="bg-gray-800 h-[48px] rounded-2xl flex-row justify-center items-center gap-2 active:opacity-80"
                                >
                                    <Boxicon name="bxs-stop" size={20} color="#ffffff" />
                                    <Text className="text-white font-bold text-sm">Detener Grabación</Text>
                                </TouchableOpacity>
                            </View>
                        ) : audio.recordedUri ? (
                            <AudioPlayer
                                uri={audio.recordedUri}
                                onDiscard={handleDiscard}
                            />
                        ) : (
                            <View className="gap-3">
                                <TouchableOpacity
                                    onPress={audio.startRecording}
                                    className="bg-primary rounded-2xl px-4 py-4 flex-row items-center justify-center gap-2 shadow-md shadow-primary/30 active:opacity-90"
                                    accessibilityRole="button"
                                    accessibilityLabel="Grabar audio"
                                >
                                    <Boxicon name="bxs-microphone" size={22} color="#ffffff" />
                                    <Text className="text-white font-bold text-base">
                                        Grabar Audio
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={pickAudio}
                                    className="bg-gray-100 rounded-2xl px-4 py-4 flex-row items-center justify-center gap-2 active:bg-gray-200"
                                    accessibilityRole="button"
                                    accessibilityLabel="Adjuntar archivo de audio"
                                >
                                    <Boxicon name="bxs-file" size={20} color="#6b7280" />
                                    <Text className="text-gray-600 font-bold text-sm">
                                        Adjuntar Archivo (mp3, wav, m4a)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <Textarea
                        label="Descripción"
                        iconName="bxs-note"
                        placeholder="Describe brevemente la historia o testimonio..."
                        value={summary}
                        onChangeText={setSummary}
                        multiline
                    />

                    <Select
                        label="Idioma"
                        iconName="bxs-globe"
                        placeholder="Seleccionar idioma..."
                        options={[
                            { label: "Español", value: "es" },
                            { label: "Inglés", value: "en" },
                        ]}
                        value={language}
                        onValueChange={(val) => setLanguage(val as "es" | "en")}
                    />

                    <DatePickerInput
                        label="Fecha de Grabación"
                        value={recordedAt}
                        onChange={setRecordedAt}
                        maximumDate={new Date()}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-md shadow-primary/30 active:opacity-90"
                        accessibilityRole="button"
                        accessibilityLabel="Guardar testimonio"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <Boxicon name="bxs-check-circle" size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-base">
                                    Guardar Testimonio
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