import React, { use, useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, Image, Modal } from "react-native";
import { Text } from "@/components/ui/text";
import { useForm, SubmitHandler } from "react-hook-form";
import Boxicon from "@/components/Boxicons";
import { Label } from "@/components/ui/label";
import { usePictures } from "@/hooks/usePictures";
import { FlatList } from "react-native-gesture-handler";
import { useVideo } from "@/hooks/useVideo";
import { useVideoPlayer, VideoView } from 'expo-video';
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

type CloseVisitInputs = {
    photos: string[];
    video: string | null;
    audio: string | null;
};

export default function EvidenceForm({
    isSyncing,
    bottomSheetRef,
    onFinalize,
}: any) {
    const pictures = usePictures();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const audio = useVoiceRecorder();

    const video = useVideo();
    const videoPlayer = useVideoPlayer(video.video ?? null, (playerInstance) => {
        playerInstance.loop = false;
    });

    const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, } = useForm<CloseVisitInputs>({
        mode: "onChange",
        defaultValues: {
            photos: [],
            video: null,
            audio: null,
        },
    });

    useEffect(() => {
        register("photos", { required: false });
        register("video", { required: "El video recorrido es obligatorio." });
        register("audio", {
            required: "El audio de conclusiones es obligatorio.",
        });
    }, [register]);

    useEffect(() => {
        setValue("photos", pictures.pictures, { 
            shouldValidate: true, 
            shouldDirty: true 
        });
    }, [pictures.pictures, setValue]);

    useEffect(() => {
        setValue("video", video.video, { 
            shouldValidate: true, 
            shouldDirty: true 
        });
    }, [video.video, setValue]);

    useEffect(() => {
        setValue("audio", audio.recordedUri, { 
            shouldValidate: true, 
            shouldDirty: true 
        });
    }, [audio.recordedUri, setValue]);

    const onSubmit: SubmitHandler<CloseVisitInputs> = (data) => {
        onFinalize(data);
    };

    return (
        <View className="gap-8">
            <Text variant="h3" className="text-primary font-bold text-center">
                Evidencia de Cierre
            </Text>

            <View className="gap-2">
                <Label className="py-0.5 text-gray-500">
                    1. Fotografías del sitio
                </Label>
                {pictures.pictures.length > 0 && (
                    <FlatList
                        data={pictures.pictures}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(picture, index) => picture + index}
                        renderItem={({ item }) => (
                            <View className="relative mr-4">
                                <TouchableOpacity onPress={() => setPreviewImage(item)}>
                                    <Image
                                        source={{ uri: item }}
                                        className="w-24 h-24 rounded-2xl bg-gray-200"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => pictures.removePicture(item)}
                                    className="absolute top-1 right-1 bg-gray-900/80 rounded-full p-1.5"
                                >
                                    <Boxicon name="bxs-x" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={pictures.takePicture}
                        className="rounded-2xl border-2 border-gray-100 bg-gray-100 flex-1"
                    >
                        <View className="flex-col gap-1 items-center justify-center rounded-2xl py-8">
                            <Boxicon
                                name="bxs-camera"
                                size={24}
                                color="#6b7280"
                            />

                            <Text className="font-medium text-center text-xs text-gray-500">
                                Usar Camara
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={pictures.pickPicture}
                        className="rounded-2xl border-2 border-gray-200 border-dashed flex-1"
                    >
                        <View className="flex-col gap-1 items-center justify-center rounded-2xl py-8">
                            <Boxicon
                                name="bxs-image"
                                size={24}
                                color="#6b7280"
                            />

                            <Text className="font-medium text-center text-xs text-gray-500">
                                Galeria
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="gap-2">
                <Label className="py-0.5 text-gray-500">
                    2. Video Recorrido <Text className="text-red-500">*</Text>
                </Label>

                {video.video ? (
                    <View className="relative mb-2 rounded-2xl overflow-hidden bg-black aspect-video">
                        <VideoView
                            player={videoPlayer}
                            style={{ width: '100%', height: '100%' }}
                            fullscreenOptions={{ enable: true }}
                            allowsPictureInPicture
                        />

                        <View className="absolute top-2 right-2 flex-row gap-2">
                            <TouchableOpacity
                                onPress={video.discardVideo}
                                className="bg-gray-900/80 rounded-full p-2"
                            >
                                <Boxicon name="bxs-trash" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={video.recordVideo}
                            className="bg-slate-800 h-[56px] rounded-2xl flex-row justify-center items-center gap-2"
                        >
                            <Boxicon name="bxs-video-plus" size={24} color="#ffffff" />
                            <Text className="text-sm font-bold text-white">
                                Grabar Video
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={video.pickVideo}
                            className="bg-gray-100 h-[46px] rounded-2xl flex-row justify-center items-center gap-2"
                        >
                            <Boxicon name="bxs-folder-up-arrow" size={20} color="#9ca3af" />
                            <Text className="text-xs font-bold text-gray-400">
                                Subir desde Galería
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View className="gap-2">
                <Label className="py-0.5 text-gray-500">
                    3. Conclusiones (Audio) <Text className="text-red-500">*</Text>
                </Label>

                {audio.isRecording ? (
                    <View className="gap-4">
                        <View className="flex-row items-center justify-center gap-4">
                            <ActivityIndicator color="#ef4444" />
                            <Text className="text-sm font-medium text-gray-700">
                                Grabando... {audio.duration}s
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={audio.stopRecording}
                            className="bg-gray-900/80 h-[46px] rounded-2xl flex-row justify-center items-center gap-2"
                        >
                            <Boxicon name="bxs-stop" size={20} color="#ffffff" />
                            <Text className="text-sm font-bold text-white">
                                Detener Grabación
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : audio.recordedUri ? (
                    <View className="bg-gray-50 rounded-2xl gap-4 p-4 w-full border border-gray-200">
                        <View className="flex-row justify-between">
                            <Text className="text-xs font-medium text-gray-500">
                                {audio.currentTime}s / {audio.duration}s
                            </Text>
                            <Text className="text-xs font-medium text-gray-500">
                                {audio.duration}s
                            </Text>
                        </View>

                        <View className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
                            <View
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${audio.progress}%` }}
                            />
                        </View>

                        <View className="flex-row items-center justify-between px-2">

                            <TouchableOpacity
                                onPress={audio.discardRecording}
                                className="p-2 bg-gray-200 rounded-full"
                            >
                                <Boxicon name="bxs-trash" size={20} color="#4b5563" />
                            </TouchableOpacity>

                            <View className="flex-row items-center gap-4">
                                <TouchableOpacity
                                    onPress={audio.togglePlayback}
                                    className="bg-primary w-12 h-12 rounded-full items-center justify-center shadow-sm"
                                >
                                    <Boxicon
                                        name={audio.isPlaying ? "bxs-pause" : "bxs-play"}
                                        size={30}
                                        color="#ffffff"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={audio.resetPlayback}>
                                    <Boxicon name="bxs-stop" size={28} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            <View className="w-9" />
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={audio.startRecording}
                        className="bg-red-500 h-[56px] py-4 rounded-2xl flex-row justify-center items-center gap-1"
                    >
                        <Boxicon name="bxs-microphone" size={24} color="#ffffff" />
                        <Text className="text-sm font-bold text-white">
                            Grabar Audio
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="gap-3">
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 ${!isValid || isSyncing ? "bg-gray-300" : "bg-gray-900"
                        }`}
                    disabled={!isValid || isSyncing}
                >
                    {isSyncing && <ActivityIndicator color="white" />}
                    <Text
                        className={`font-bold text-center text-base ${!isValid ? "text-gray-500" : "text-white"
                            }`}
                    >
                        {isSyncing ? "Guardando..." : "Confirmar y Finalizar"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => bottomSheetRef.current?.dismiss()}
                    disabled={isSyncing}
                    className="w-full py-3"
                >
                    <Text className="text-sm font-semibold text-gray-500 text-center">
                        Cancelar
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={!!previewImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPreviewImage(null)}
            >
                <View className="flex-1 bg-black justify-center items-center relative">
                    <TouchableOpacity
                        onPress={() => setPreviewImage(null)}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <View
                            className="absolute top-12 right-6 z-50 bg-gray-800/80 p-2 rounded-full"
                        >
                            <Boxicon name="bx-x" size={24} color="#fff" />
                        </View>

                        {previewImage && (
                            <Image
                                source={{ uri: previewImage }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}
