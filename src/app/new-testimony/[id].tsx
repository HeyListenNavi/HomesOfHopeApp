import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, ToastAndroid, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { useNavigation, useLocalSearchParams } from "expo-router";
import DatePickerInput from "@/components/DatePickerInput";
import TimePickerInput from "@/components/TimePickerInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as DocumentPicker from "expo-document-picker";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useFileCompression } from "@/hooks/useFileCompression";
import { MAX_AUDIO_DURATION_SECONDS, TESTIMONY_MAX_BYTES } from "@/lib/mediaCompression";
import { useScreenTopPadding } from "@/lib/layout";
import { toLocalDateString, toLocalTimeString, combineDateAndTime } from "@/lib/utils";
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
    const { compressAudio, isCompressing } = useFileCompression();
    const [recordedDate, setRecordedDate] = useState(toLocalDateString);
    const [recordedTime, setRecordedTime] = useState(toLocalTimeString);
    const [pickedFileName, setPickedFileName] = useState<string | null>(null);
    const [pickedMimeType, setPickedMimeType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const pickAudio = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/m4a", "audio/*"],
            copyToCacheDirectory: false,
        });
        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            await compressAudio({
                uri: asset.uri,
                fileName: asset.name,
                mimeType: asset.mimeType,
                fileSize: asset.size,
                maxBytes: TESTIMONY_MAX_BYTES,
                maxDurationSeconds: MAX_AUDIO_DURATION_SECONDS,
                onSuccess: (processed) => {
                    setPickedFileName(processed.name);
                    setPickedMimeType(processed.mimeType);
                    audio.setRecordedUri(processed.uri);
                },
            });
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
                else mimeType = "audio/mp4";
            }

            await storeTestimony.mutateAsync({
                data: {
                    family_profile_id: targetFamilyId,
                    language: "es",
                    recorded_at: combineDateAndTime(recordedDate, recordedTime),
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
                            Audio (máx. 15 min)
                        </Text>

                        {isCompressing ? (
                            <View
                                key="testimony-compressing"
                                className="bg-primary/5 border border-primary/20 rounded-2xl p-5 items-center justify-center gap-2"
                            >
                                <ActivityIndicator size="small" color="#61b346" />
                                <Text className="text-gray-700 font-bold text-sm">
                                    Procesando y comprimiendo audio...
                                </Text>
                            </View>
                        ) : audio.isRecording ? (
                            <View
                                key="testimony-recording"
                                className="bg-red-50 rounded-2xl p-4 gap-3 border border-red-100"
                            >
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
                                key="testimony-preview"
                                uri={audio.recordedUri}
                                onDiscard={handleDiscard}
                                maxDurationSeconds={MAX_AUDIO_DURATION_SECONDS}
                            />
                        ) : (
                            <View key="testimony-actions" className="gap-3">
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

                    <DatePickerInput
                        label="Fecha de Grabación"
                        value={recordedDate}
                        onChange={setRecordedDate}
                        maximumDate={new Date()}
                    />

                    <TimePickerInput
                        label="Hora de Grabación"
                        value={recordedTime}
                        onChange={setRecordedTime}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading || isCompressing}
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
