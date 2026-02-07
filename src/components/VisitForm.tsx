import React, { useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { useForm, SubmitHandler } from "react-hook-form";
import Boxicon from "@/components/Boxicons";
import { Label } from "@/components/ui/label";
import { Box } from "lucide-react-native";

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
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<CloseVisitInputs>({
        mode: "onChange",
        defaultValues: {
            photos: [],
            video: null,
            audio: null,
        },
    });

    const videoUri = watch("video");
    const audioUri = watch("audio");
    const photos = watch("photos");

    useEffect(() => {
        register("photos", { required: false });
        register("video", { required: "El video recorrido es obligatorio." });
        register("audio", {
            required: "El audio de conclusiones es obligatorio.",
        });
    }, [register]);

    const onSubmit: SubmitHandler<CloseVisitInputs> = (data) => {
        onFinalize(data);
    };

    const handleCapturePhoto = () => {
        const newPhoto = "file://photo.jpg";
        setValue("photos", [...(photos || []), newPhoto]);
    };

    const handleRecordVideo = () => {
        setValue("video", "file://video.mp4", { shouldValidate: true });
    };

    const handleRecordAudio = () => {
        setValue("audio", "file://audio.mp3", { shouldValidate: true });
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
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        className="rounded-2xl border-2 border-gray-100 bg-gray-100 flex-1">
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
                        className="rounded-2xl border-2 border-gray-200 border-dashed flex-1">
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
                <View className="gap-3">
                    <TouchableOpacity className="bg-slate-800 h-[56px] py-4 rounded-2xl flex-row justify-center items-center gap-1">
                        <Boxicon
                            name="bxs-video-plus"
                            size={24}
                            color="#ffffff"
                        />
                        <Text
                            className="text-sm font-bold text-white"
                        >
                            Grabar Video
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 h-[46px] py-4 rounded-2xl flex-row justify-center items-center gap-1">
                        <Boxicon
                            name="bxs-folder-up-arrow"
                            size={20}
                            color="#9ca3af"
                        />
                        <Text
                            className="text-xs font-bold text-gray-400"
                        >
                            Subir desde Galeria
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="gap-2">
                <Label className="py-0.5 text-gray-500">
                    3. Conclusiones (Audio) <Text className="text-red-500">*</Text>
                </Label>
                <TouchableOpacity className="bg-red-500 h-[56px] py-4 rounded-2xl flex-row justify-center items-center gap-1">
                    <Boxicon
                        name="bxs-microphone"
                        size={24}
                        color="#ffffff"
                    />
                    <Text
                        className="text-sm font-bold text-white"
                    >
                        Grabar Audio
                    </Text>
                </TouchableOpacity>
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
        </View>
    );
}
