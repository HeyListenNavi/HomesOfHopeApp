import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/ui/text";
import { useForm, SubmitHandler } from "react-hook-form";
import Boxicon from "@/components/Boxicons";
import { FlatList } from "react-native-gesture-handler";
import { useVideoPlayer, VideoView } from "expo-video";
import SectionHeader from "@/components/SectionHeader";
import AudioPlayerPreview from "@/components/AudioPlayerPreview";

type CloseVisitInputs = {
    photos: string[];
    video: string | null;
    audio: string | null;
};

const VisitForm = ({
    isSyncing,
    bottomSheetRef,
    onFinalize,
    pictures,
    audio,
    video,
}: any) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const videoPlayer = useVideoPlayer(video.video ?? null, (p) => {
        p.loop = false;
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { isValid },
    } = useForm<CloseVisitInputs>({
        mode: "onChange",
        defaultValues: { photos: [], video: null, audio: null },
    });

    useEffect(() => { register("photos", { required: false }); }, [register]);
    useEffect(() => { register("video", { required: true }); }, [register]);
    useEffect(() => { register("audio", { required: true }); }, [register]);

    useEffect(() => {
        setValue("photos", pictures.pictures, { shouldValidate: true, shouldDirty: true });
    }, [pictures.pictures, setValue]);

    useEffect(() => {
        setValue("video", video.video, { shouldValidate: true, shouldDirty: true });
    }, [video.video, setValue]);

    useEffect(() => {
        setValue("audio", audio.recordedUri, { shouldValidate: true, shouldDirty: true });
    }, [audio.recordedUri, setValue]);

    const onSubmit: SubmitHandler<CloseVisitInputs> = (data) => onFinalize(data);

    return (
        <View className="gap-6">

            <View className="items-center gap-1 pt-2">
                <Text className="text-2xl font-bold text-gray-800">Evidencia de Cierre</Text>
                <Text className="text-gray-500 text-base text-center">
                    Completa los campos para finalizar la visita
                </Text>
            </View>

            <View className="gap-3">
                <SectionHeader emoji="📷" title="Fotografías del sitio" />

                {pictures.pictures.length > 0 && (
                    <FlatList
                        data={pictures.pictures}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => item + index}
                        contentContainerStyle={{ paddingBottom: 4 }}
                        renderItem={({ item }) => (
                            <View className="relative mr-3">
                                <TouchableOpacity
                                    onPress={() => setPreviewImage(item)}
                                    activeOpacity={0.85}
                                >
                                    <Image
                                        source={{ uri: item }}
                                        style={{ width: 96, height: 96, borderRadius: 16 }}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => pictures.removePicture(item)}
                                    className="absolute top-1.5 right-1.5 bg-gray-900/80 rounded-full p-2"
                                >
                                    <Boxicon name="bxs-trash" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}

                <TouchableOpacity
                    onPress={pictures.takePicture}
                    className="bg-gray-100 rounded-2xl py-6 items-center justify-center gap-2 active:bg-gray-200"
                    accessibilityRole="button"
                    accessibilityLabel="Tomar foto con cámara"
                >
                    <Boxicon name="bxs-camera" size={24} color="#6b7280" />
                    <Text className="text-gray-500 text-sm font-bold">Tomar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={pictures.pickPicture}
                    className="py-1.5 items-center"
                    accessibilityRole="button"
                    accessibilityLabel="Elegir foto de galería"
                >
                    <Text className="text-gray-400 text-sm font-semibold text-center">
                        o elige de la galería
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="gap-3">
                <SectionHeader emoji="🎥" title="Video Recorrido" badge="Requerido" />

                {video.video ? (
                    <View className="rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-96 w-full mx-auto shadow-md">
                        <VideoView
                            player={videoPlayer}
                            style={{ width: "100%", height: "100%" }}
                            fullscreenOptions={{ enable: true }}
                            allowsPictureInPicture
                            nativeControls
                        />
                        <TouchableOpacity
                            onPress={video.discardVideo}
                            className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-2 z-10"
                        >
                            <Boxicon name="bxs-trash" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="gap-2">
                        <TouchableOpacity
                            onPress={video.recordVideo}
                            className="bg-gray-800 h-[56px] rounded-2xl flex-row justify-center items-center gap-2 active:opacity-80"
                            accessibilityRole="button"
                            accessibilityLabel="Grabar video"
                        >
                            <Boxicon name="bxs-video-plus" size={22} color="#ffffff" />
                            <Text className="text-white font-bold">Grabar Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={video.pickVideo}
                            className="py-1.5 items-center"
                            accessibilityRole="button"
                            accessibilityLabel="Subir video desde galería"
                        >
                            <Text className="text-gray-400 text-sm font-semibold text-center">
                                o sube uno desde la galería
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View className="gap-3">
                <SectionHeader emoji="🎙️" title="Conclusiones (Audio)" badge="Requerido" />

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
                    <AudioPlayerPreview
                        uri={audio.recordedUri}
                        onClear={audio.discardRecording}
                        title="Nota de voz"
                    />
                ) : (
                    <TouchableOpacity
                        onPress={audio.startRecording}
                        className="bg-red-500 h-[56px] rounded-2xl flex-row justify-center items-center gap-2 shadow-md shadow-red-500/30 active:opacity-80"
                        accessibilityRole="button"
                        accessibilityLabel="Grabar audio de conclusiones"
                    >
                        <Boxicon name="bxs-microphone" size={24} color="#ffffff" />
                        <Text className="text-white font-bold">Grabar Audio</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="gap-3 pt-2 pb-16">
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className={`w-full h-[56px] rounded-2xl flex-row justify-center items-center gap-2 ${!isValid || isSyncing
                        ? "bg-gray-200"
                        : "bg-primary"
                        }`}
                    style={
                        isValid && !isSyncing
                            ? {
                                shadowColor: "hsl(105.1 43.7% 48.8%)",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 8,
                            }
                            : undefined
                    }
                    disabled={!isValid || isSyncing}
                    accessibilityRole="button"
                    accessibilityLabel="Confirmar y finalizar visita"
                >
                    {isSyncing && <ActivityIndicator color="white" />}
                    <Text
                        className={`font-bold text-base ${!isValid || isSyncing ? "text-gray-400" : "text-white"
                            }`}
                    >
                        {isSyncing ? "Guardando..." : "Confirmar y Finalizar"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => bottomSheetRef.current?.dismiss()}
                    disabled={isSyncing}
                    className="w-full py-3 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar"
                >
                    <Text className="text-gray-400 font-semibold text-sm text-center">
                        Cancelar
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={!!previewImage}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewImage(null)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setPreviewImage(null)}
                >
                    <View className="absolute top-12 right-6 z-50 bg-gray-800/80 p-2 rounded-full">
                        <Boxicon name="bx-x" size={24} color="#fff" />
                    </View>
                    {previewImage && (
                        <Image
                            source={{ uri: previewImage }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="contain"
                            transition={200}
                        />
                    )}
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default VisitForm;
