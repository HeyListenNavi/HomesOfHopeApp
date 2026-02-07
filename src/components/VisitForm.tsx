import React, { useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { useForm, SubmitHandler } from "react-hook-form";
import Boxicon from "@/components/Boxicons";
import { Label } from "@/components/ui/label";

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
        <View className="gap-4">
            <Text variant="h3" className="text-primary font-bold text-center">
                Evidencia de Cierre
            </Text>

            <View className="gap-6">
                <View>
                    <Text className="text-xs font-bold text-gray-700 uppercase mb-3">
                        1. Fotografías del sitio
                    </Text>
                    <Label className="py-0.5 text-gray-500">
                        1. Fotografías del sitio
                    </Label>
                    <TouchableOpacity
                        onPress={handleCapturePhoto}
                        className="h-24 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50 active:bg-blue-50 active:border-blue-300"
                    >
                        <View className="w-10 h-10 bg-white rounded-full items-center justify-center mb-2">
                            <Boxicon
                                name="bxs-camera"
                                size={20}
                                color="#9CA3AF"
                            />
                        </View>
                        <Text className="text-xs font-medium text-gray-500">
                            {photos?.length > 0
                                ? `${photos.length} Fotos tomadas`
                                : "Tomar fotos"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <Text className="text-xs font-bold text-gray-700 uppercase mb-3">
                        2. Video Recorrido{" "}
                        <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={handleRecordVideo}
                        className={`h-20 border rounded-xl flex-row items-center px-4 bg-white active:bg-gray-50 ${
                            errors.video
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                        }`}
                    >
                        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                            <Boxicon
                                name="bxs-video"
                                size={20}
                                color={videoUri ? "#16a34a" : "#dc2626"}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-800">
                                {videoUri
                                    ? "Video Guardado"
                                    : "Grabar Recorrido"}
                            </Text>
                            <Text className="text-xs text-gray-400">
                                {videoUri
                                    ? "Listo para subir"
                                    : "Máximo 30 segundos"}
                            </Text>
                        </View>
                        <Boxicon
                            name={
                                videoUri
                                    ? "bx-check-circle"
                                    : "bx-chevron-right"
                            }
                            size={24}
                            color={videoUri ? "#16a34a" : "#9CA3AF"}
                        />
                    </TouchableOpacity>
                    {errors.video && (
                        <Text className="text-red-500 text-xs mt-1 font-medium">
                            {errors.video.message}
                        </Text>
                    )}
                </View>

                <View>
                    <Text className="text-xs font-bold text-gray-700 uppercase mb-3">
                        3. Conclusiones (Audio){" "}
                        <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={handleRecordAudio}
                        className={`w-full border rounded-xl p-4 flex-row items-center justify-center gap-2 active:bg-red-100 ${
                            errors.audio
                                ? "border-red-500 bg-red-50"
                                : "bg-red-50 border-red-100"
                        }`}
                    >
                        {!audioUri && (
                            <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        <Text
                            className={`text-sm font-bold ${
                                audioUri ? "text-green-700" : "text-red-600"
                            }`}
                        >
                            {audioUri ? "Audio Grabado" : "Iniciar Grabación"}
                        </Text>
                        <Boxicon
                            name={
                                audioUri ? "bxs-check-shield" : "bxs-microphone"
                            }
                            size={18}
                            color={audioUri ? "#15803d" : "#dc2626"}
                        />
                    </TouchableOpacity>
                    {errors.audio && (
                        <Text className="text-red-500 text-xs mt-1 font-medium">
                            {errors.audio.message}
                        </Text>
                    )}
                </View>
            </View>

            <View className="gap-3">
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center gap-2 ${
                        !isValid || isSyncing ? "bg-gray-300" : "bg-gray-900"
                    }`}
                    disabled={!isValid || isSyncing}
                >
                    {isSyncing && <ActivityIndicator color="white" />}
                    <Text
                        className={`font-bold text-center text-base ${
                            !isValid ? "text-gray-500" : "text-white"
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
