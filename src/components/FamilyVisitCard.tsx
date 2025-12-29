import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import Textarea from "./Textarea";
("@/components/Textarea");
import BrandBoxicon from "@/components/BrandBoxicons";
import AudioPlayerPreview from "@/components/AudioPlayerPreview";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useRouter } from "expo-router";

export interface FamilyVisit {
    id: number;
    name: string;
    location: string;
    status: "pending" | "visited";
    phone?: string;
    coords?: { lat: number; lng: number };
}

interface VisitFamilyCardProps {
    family: FamilyVisit;
    index: number;
}

export const VisitFamilyCard = ({ family, index }: VisitFamilyCardProps) => {
    const isVisited = family.status === "visited";

    const router = useRouter();
    const voiceRecorder = useVoiceRecorder();
    const imagePicker = useImagePicker();
    const [noteText, setNoteText] = useState("");

    return (
        <TouchableOpacity
            className="p-4 rounded-2xl gap-4 bg-white mb-4 border border-gray-100"
            onPress={() => router.push("/family-profile/123")}
        >
            <View className="flex-row items-center gap-3">
                <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                        isVisited ? "bg-primary" : "bg-gray-200"
                    }`}
                >
                    <Text
                        className={`font-bold ${
                            isVisited ? "text-white" : "text-gray-500"
                        }`}
                    >
                        {index}
                    </Text>
                </View>

                <View className="flex-1">
                    <Text
                        className={`font-bold text-lg ${
                            isVisited ? "text-primary" : "text-gray-800"
                        }`}
                    >
                        {family.name}
                    </Text>
                    <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        {family.location}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between gap-2">
                <TouchableOpacity className="flex-row items-center flex-1 gap-1 px-4 py-3 bg-[#9BD189]/10 rounded-xl justify-center">
                    <BrandBoxicon
                        name="bx-whatsapp"
                        size={24}
                        color="#61b346"
                    />
                    <Text className="text-primary font-bold">WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center flex-1 gap-1 px-4 py-3 bg-blue-50 rounded-xl justify-center">
                    <Boxicon name="bxs-map" size={24} color="#3b82f6" />
                    <Text className="text-[#3b82f6] font-bold">Ver mapa</Text>
                </TouchableOpacity>

                <Dialog>
                    <DialogTrigger asChild>
                        <TouchableOpacity
                            className={`px-3 py-3 rounded-2xl ${
                                isVisited ? "bg-primary" : "bg-gray-200"
                            }`}
                        >
                            <Boxicon
                                name="bxs-check-circle"
                                size={24}
                                color={isVisited ? "white" : "#9ca3af"}
                            />
                        </TouchableOpacity>
                    </DialogTrigger>

                    <DialogContent className="w-[90vw] max-w-none bg-white rounded-3xl">
                        <KeyboardAvoidingView
                            behavior="padding"
                            keyboardVerticalOffset={60}
                        >
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                contentContainerClassName="px-4 py-6"
                            >
                                <DialogHeader className="items-center gap-3">
                                    <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                                        Confirmar Visita
                                    </DialogTitle>

                                    <DialogDescription className="text-gray-500 text-center text-base">
                                        ¿Deseas marcar a esta familia como
                                        visitada? Esto actualizará el progreso
                                        de tu ruta.
                                    </DialogDescription>
                                </DialogHeader>

                                <View className="py-4 gap-3">
                                    <View>
                                        <Textarea
                                            value={noteText}
                                            onChangeText={setNoteText}
                                            label="Notas y Evidencia"
                                            children={
                                                <Text className="ml-auto text-sm text-gray-300">
                                                    {imagePicker.length} fotos •{" "}
                                                    {voiceRecorder.recordedUri
                                                        ? "1 audio"
                                                        : "Sin audio"}
                                                </Text>
                                            }
                                            placeholder="Escribe tus observaciones aquí..."
                                        />

                                        <View className="px-3 py-2 flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={imagePicker.pickImages}
                                                className="flex-row items-center gap-1 bg-white px-3 py-2 rounded-lg"
                                            >
                                                <Boxicon
                                                    name="bxs-camera"
                                                    size={20}
                                                    color="#4b5563"
                                                />
                                                <Text className="text-sm font-bold text-gray-600">
                                                    Foto
                                                </Text>
                                            </TouchableOpacity>

                                            {!voiceRecorder.recordedUri ? (
                                                <TouchableOpacity
                                                    onPress={
                                                        voiceRecorder.isRecording
                                                            ? voiceRecorder.stopRecording
                                                            : voiceRecorder.startRecording
                                                    }
                                                    className={`flex-row items-center gap-2 px-3 py-2 rounded-lg ${
                                                        voiceRecorder.isRecording
                                                            ? "bg-red-50 border border-red-100"
                                                            : "bg-white"
                                                    }`}
                                                >
                                                    <Boxicon
                                                        name={
                                                            voiceRecorder.isRecording
                                                                ? "bxs-stop-circle"
                                                                : "bxs-microphone"
                                                        }
                                                        size={24}
                                                        color={
                                                            voiceRecorder.isRecording
                                                                ? "#ef4444"
                                                                : "#4b5563"
                                                        }
                                                    />

                                                    {voiceRecorder.isRecording ? (
                                                        <View className="flex-row items-center gap-1">
                                                            <Text className="text-sm font-bold text-red-500">
                                                                Grabando
                                                            </Text>
                                                            <Text className="text-sm font-mono font-bold text-red-600 min-w-[24px]">
                                                                {
                                                                    voiceRecorder.duration
                                                                }
                                                                s
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <Text className="text-sm font-bold text-gray-600">
                                                            Audio
                                                        </Text>
                                                    )}
                                                </TouchableOpacity>
                                            ) : (
                                                <View className="flex-row items-center gap-1 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                    <Boxicon
                                                        name="bxs-check-circle"
                                                        size={20}
                                                        color="#61b346"
                                                    />
                                                    <Text className="text-sm font-bold text-green-700">
                                                        Guardado
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {voiceRecorder.recordedUri && (
                                        <AudioPlayerPreview
                                            uri={voiceRecorder.recordedUri}
                                            onClear={
                                                voiceRecorder.discardRecording
                                            }
                                        />
                                    )}

                                    {imagePicker.length > 0 && (
                                        <FlatList
                                            horizontal
                                            data={imagePicker.images}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            showsHorizontalScrollIndicator={
                                                false
                                            }
                                            className="mt-1 max-h-24 grow-0"
                                            contentContainerClassName="pr-4 pl-1 py-1"
                                            ItemSeparatorComponent={() => (
                                                <View className="w-2" />
                                            )}
                                            renderItem={({
                                                item: uri,
                                                index,
                                            }) => (
                                                <View
                                                    className="w-20 h-20 relative"
                                                    onStartShouldSetResponder={() =>
                                                        true
                                                    }
                                                >
                                                    <Image
                                                        source={{ uri }}
                                                        className="w-20 h-20 rounded-xl border border-gray-200"
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            imagePicker.removeImage(
                                                                index
                                                            )
                                                        }
                                                        className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-gray-200 z-50"
                                                        activeOpacity={0.7}
                                                        hitSlop={{
                                                            top: 10,
                                                            bottom: 10,
                                                            left: 10,
                                                            right: 10,
                                                        }}
                                                    >
                                                        <Boxicon
                                                            name="bx-x"
                                                            size={16}
                                                            color="#ef4444"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        />
                                    )}
                                </View>

                                <DialogFooter className="flex-row gap-2 justify-center">
                                    <DialogClose asChild>
                                        <TouchableOpacity className="p-4 rounded-xl bg-transparent">
                                            <Text className="text-gray-500 font-semibold">
                                                Cancelar
                                            </Text>
                                        </TouchableOpacity>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <TouchableOpacity className="bg-primary p-4 rounded-xl">
                                            <Text className="text-white font-bold">
                                                Marcar como Visitada
                                            </Text>
                                        </TouchableOpacity>
                                    </DialogClose>
                                </DialogFooter>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </DialogContent>
                </Dialog>
            </View>
        </TouchableOpacity>
    );
};
