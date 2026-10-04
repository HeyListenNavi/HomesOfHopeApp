import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import {
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    ToastAndroid,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DocumentType, TaskResource } from "@/services/generated/apiTypes";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheet from "@/components/BottomSheet";
import VisitForm from "@/components/VisitForm";
import Can from "@/components/Can";
import { Permission } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useScreenTopPadding } from "@/lib/layout";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import { usePictures } from "@/hooks/usePictures";
import { useVideo } from "@/hooks/useVideo";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import {
    useVisitShow,
    useTaskUpdate,
    useVisitUpdate,
    useDocumentStore,
    useEvidenceStore,
    getVisitIndexInfiniteQueryKey,
    getVisitIndexQueryKey
} from "@/services/generated/apiEndpoints";
import { VisitStatus } from "@/services/generated/apiTypes";
import { toLocalDateString } from "@/lib/utils";
import StaffCard from "@/components/StaffCard";

export default function VisitClosePage() {
    const router = useRouter();
    const id = Number(useLocalSearchParams<{ id: string }>().id);
    const topPadding = useScreenTopPadding();
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const { data: visit, isPending, isError, refetch, isFetching } = useVisitShow(
        id,
        {
            query: {
                enabled: !isNaN(id) && id > 0,
            },
        }
    );

    const updateTask = useTaskUpdate();
    const updateVisit = useVisitUpdate();
    const storeEvidence = useEvidenceStore();
    const queryClient = useQueryClient();

    const pictures = usePictures();
    const video = useVideo();
    const audio = useVoiceRecorder();

    const [isSyncing, setIsSyncing] = useState(false);

    const responsible_member = visit?.familyProfile?.responsibleMember;
    const familyPhoto = visit?.familyProfile?.family_photo_url;

    const isLand = visit?.location_type === "land";
    const relevantMapsLink = isLand
        ? visit?.familyProfile?.land_address_link
        : visit?.familyProfile?.home_address_link;
    const locationLabel =
        visit?.location_type === "home"
            ? "Vivienda Actual"
            : visit?.location_type === "land"
                ? "Terreno"
                : visit?.location_type === "virtual"
                    ? "Virtual"
                    : visit?.location_type || "Visita";

    const [localTasks, setLocalTasks] = useState<TaskResource[]>([]);

    useEffect(() => {
        if (visit?.tasks) {
            setLocalTasks(visit.tasks);
        }
    }, [visit?.tasks]);

    const { can } = usePermissions();
    const canUpdateVisit = can(Permission.visitUpdate);

    const toggleTask = (id: number) => {
        setLocalTasks((tasks) =>
            tasks.map((task) =>
                task.id === id
                    ? { ...task, status: task.status === "completed" ? "pending" : "completed" }
                    : task
            )
        );
    };

    const handleFinalizeVisit = async (data: { photos: string[], video: string | null, audio: string | null }) => {
        if (visit?.status !== VisitStatus.scheduled) {
            ToastAndroid.show("La visita no ha sido programada", ToastAndroid.SHORT);
            bottomSheetRef.current?.dismiss();
            return;
        }

        setIsSyncing(true);
        try {
            const taskPromises = localTasks.map((localTask) => {
                const originalTask = visit?.tasks?.find(t => t.id === localTask.id);

                if (originalTask && originalTask.status !== localTask.status) {
                    return updateTask.mutateAsync({
                        task: localTask.id!,
                        data: { status: localTask.status }
                    });
                }
            }).filter(Boolean);

            await Promise.all(taskPromises);

            await updateVisit.mutateAsync({
                visit: id,
                data: {
                    status: "completed",
                    completed_at: toLocalDateString(),
                }
            });

            const uploadPromises = [];

            data.photos.forEach((uri, i) => {
                uploadPromises.push(storeEvidence.mutateAsync({
                    data: {
                        visit_id: id,
                        file: { uri, type: "image/jpeg", name: `evidence_${i}.jpg` } as any,
                        description: "Fotografía",
                    }
                }));
            });
            if (data.video) {
                uploadPromises.push(storeEvidence.mutateAsync({
                    data: {
                        visit_id: id,
                        file: { uri: data.video, type: "video/mp4", name: `video.mp4` } as any,
                        description: "Video Recorrido",
                    }
                }));
            }
            if (data.audio) {
                uploadPromises.push(storeEvidence.mutateAsync({
                    data: {
                        visit_id: id,
                        file: { uri: data.audio, type: "audio/mpeg", name: `audio.mp3` } as any,
                        description: "Conclusiones (Audio)",
                    }
                }));
            }

            await Promise.all(uploadPromises);

            ToastAndroid.show("Visita finalizada correctamente", ToastAndroid.SHORT);
            bottomSheetRef.current?.dismiss();
            queryClient.invalidateQueries({ queryKey: getVisitIndexQueryKey() });
            queryClient.invalidateQueries({ queryKey: getVisitIndexInfiniteQueryKey() });
            refetch();
            router.back();

        } catch (error) {
            ToastAndroid.show("Error al finalizar la visita", ToastAndroid.SHORT);
        } finally {
            setIsSyncing(false);
        }
    };

    const openMapsLink = async () => {
        if (!relevantMapsLink) {
            ToastAndroid.show("Enlace de mapas no disponible.", ToastAndroid.SHORT);
            return;
        }
        try {
            await Linking.openURL(relevantMapsLink);
        } catch {
            ToastAndroid.show("No se pudo abrir la aplicación de mapas.", ToastAndroid.SHORT);
        }
    };

    const openPhone = async () => {
        const phone = responsible_member?.phone;
        if (!phone) {
            ToastAndroid.show("Teléfono no disponible.", ToastAndroid.SHORT);
            return;
        }
        try {
            await Linking.openURL(`tel:${phone}`);
        } catch {
            ToastAndroid.show("No se pudo abrir la app de teléfono.", ToastAndroid.SHORT);
        }
    };

    const openWhatsapp = async () => {
        const phone = responsible_member?.phone;
        if (!phone) {
            ToastAndroid.show("Teléfono no disponible.", ToastAndroid.SHORT);
            return;
        }
        try {
            await Linking.openURL(`https://wa.me/${phone.replace(/\D/g, "")}`);
        } catch {
            ToastAndroid.show("No se pudo abrir WhatsApp.", ToastAndroid.SHORT);
        }
    };

    if (isPending) {
        return (
            <View
                className="flex-1 bg-gray-100 items-center justify-center"
                style={{ paddingTop: topPadding }}
            >
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    if (isError || !visit) {
        return (
            <View
                className="flex-1 bg-gray-100 p-6 justify-center"
                style={{ paddingTop: topPadding }}
            >
                <EmptyState
                    emoji="⚠️"
                    title="Visita no encontrada"
                    subtitle="No se pudieron cargar los detalles de la visita."
                />
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-primary py-4 px-6 rounded-2xl items-center"
                >
                    <Text className="text-white font-bold text-base">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const completedCount = localTasks.filter(t => t.status === "completed").length;
    const totalCount = localTasks.length;

    const wrappedPictures = {
        ...pictures,
        takePicture: async () => {
            bottomSheetRef.current?.dismiss();
            await pictures.takePicture();
            setTimeout(() => {
                bottomSheetRef.current?.present();
            }, 300);
        },
        pickPicture: async () => {
            await pictures.pickPicture();
        },
    };

    const wrappedVideo = {
        ...video,
        recordVideo: async () => {
            bottomSheetRef.current?.dismiss();
            await video.recordVideo();
            setTimeout(() => {
                bottomSheetRef.current?.present();
            }, 300);
        },
        pickVideo: async () => {
            await video.pickVideo();
        },
    };

    const openFinalizeSheet = () => {
        if (visit?.status !== VisitStatus.scheduled) {
            ToastAndroid.show("La visita no ha sido programada", ToastAndroid.SHORT);
            return;
        }
        bottomSheetRef.current?.present();
    };

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-6 pb-8 gap-6"
                contentContainerStyle={{ paddingTop: topPadding }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        tintColor="#61b346"
                        colors={["#61b346"]}
                    />
                }
            >
                <TouchableOpacity
                    className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden active:opacity-90"
                    onPress={() =>
                        visit.family_profile_id &&
                        router.push(`/family-profile/${visit.family_profile_id}`)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Ver perfil de ${visit.familyProfile?.family_name}`}
                >
                    {familyPhoto ? (
                        <Image
                            source={{ uri: familyPhoto }}
                            style={{ width: "100%", height: 256 }}
                            contentFit="cover"
                            transition={200}
                            cachePolicy="memory-disk"
                        />
                    ) : (
                        <View className="w-full h-64 bg-gray-100 items-center justify-center">
                            <Boxicon name="bxs-home-heart" size={40} color="#d1d5db" />
                        </View>
                    )}

                    <View className="px-5 py-4 flex-row items-center gap-4">
                        <View className="flex-1 gap-1">
                            <Text
                                className="font-bold text-gray-800 text-xl leading-tight"
                                numberOfLines={1}
                            >
                                {visit.familyProfile?.family_name ?? "Sin nombre"}
                            </Text>

                            {responsible_member && (
                                <Text
                                    className="text-gray-500 text-base font-medium"
                                    numberOfLines={1}
                                >
                                    {responsible_member.full_name}
                                </Text>
                            )}

                            <View className="flex-row items-center gap-2 mt-1">
                                <Badge className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full">
                                    <Text className="text-primary text-sm font-bold">
                                        {locationLabel}
                                    </Text>
                                </Badge>
                            </View>
                        </View>

                        <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
                    </View>
                </TouchableOpacity>

                <View className="gap-3">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={openPhone}
                            className="flex-1 bg-white rounded-3xl px-4 py-5 gap-1.5 justify-center items-center shadow-md shadow-black/5 active:bg-gray-50"
                            accessibilityRole="button"
                            accessibilityLabel="Llamar al responsable"
                        >
                            <Boxicon name="bxs-phone" size={26} color="#6b7280" />
                            <Text className="text-gray-600 text-sm font-bold">Llamar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={openWhatsapp}
                            className="flex-1 bg-white rounded-3xl px-4 py-5 gap-1.5 justify-center items-center shadow-md shadow-black/5 active:bg-gray-50"
                            accessibilityRole="button"
                            accessibilityLabel="Enviar WhatsApp al responsable"
                        >
                            <BrandBoxicon name="bx-whatsapp" size={26} color="#16a34a" />
                            <Text className="text-gray-600 text-sm font-bold">WhatsApp</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={openMapsLink}
                        className="bg-primary rounded-3xl px-4 py-5 flex-row justify-center items-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                        accessibilityRole="button"
                        accessibilityLabel="Ir a la ubicación de la visita"
                    >
                        <Boxicon name="bxs-location" size={22} color="#ffffff" />
                        <Text className="text-white font-bold text-base">
                            Ir a la Ubicación
                        </Text>
                    </TouchableOpacity>
                </View>

                {visit.attendants && visit.attendants.length > 0 ? (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-3">
                        <SectionHeader emoji="👥" title="Equipo" />

                        <View className="flex-row flex-wrap gap-2 pt-1">
                            {visit.attendants.map((attendant, index) => (
                                <View
                                    key={attendant.id ?? index}
                                    className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-full"
                                >
                                    <Boxicon name="bxs-user-circle" size={18} color="#6b7280" />
                                    <Text className="text-gray-700 font-semibold text-sm">
                                        {attendant.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {visit.outcome_summary ? (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-3">
                        <SectionHeader emoji="📋" title="Instrucciones" />
                        <Text className="text-gray-700 leading-relaxed text-base">
                            {visit.outcome_summary}
                        </Text>
                    </View>
                ) : null}

                {localTasks.length > 0 ? (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-4">
                        <SectionHeader
                            emoji="✅"
                            title="Tareas"
                            badge={
                                <Badge className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full">
                                    <Text className="text-primary text-sm font-bold">
                                        {completedCount}/{totalCount}
                                    </Text>
                                </Badge>
                            }
                        />

                        <View className="gap-2">
                            {localTasks.map((task: TaskResource) => {
                                const done = task.status === "completed";
                                return (
                                    <TouchableOpacity
                                        key={task.id}
                                        onPress={() => canUpdateVisit && toggleTask(task.id!)}
                                        className="flex-row items-center gap-4 px-4 py-4 rounded-2xl bg-gray-100"
                                        style={
                                            done
                                                ? { backgroundColor: "hsla(105.1, 43.7%, 48.8%, 0.1)" }
                                                : undefined
                                        }
                                        accessibilityRole="checkbox"
                                        accessibilityState={{ checked: done }}
                                        accessibilityLabel={task.title ?? "Tarea"}
                                    >
                                        <Boxicon
                                            name={done ? "bxs-check-circle" : "bx-circle"}
                                            size={24}
                                            color={done ? "#16a34a" : "#9ca3af"}
                                        />
                                        <View className="flex-1 gap-0.5">
                                            <Text
                                                className={`text-base font-bold ${done ? "text-gray-400 line-through" : "text-gray-800"
                                                    }`}
                                            >
                                                {task.title}
                                            </Text>
                                            {task.description ? (
                                                <Text
                                                    className={`text-sm ${done ? "text-gray-400" : "text-gray-500"
                                                        }`}
                                                >
                                                    {task.description}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ) : null}

            </ScrollView>

            <View className="px-6 pb-8 pt-4 bg-gray-100">
                <Can permission={Permission.visitUpdate}>
                    <TouchableOpacity
                        onPress={openFinalizeSheet}
                        className="w-full flex-row items-center justify-center gap-2 py-5 rounded-3xl bg-primary shadow-lg shadow-primary/30 active:opacity-90"
                        accessibilityRole="button"
                        accessibilityLabel="Finalizar visita y subir evidencia"
                    >
                        <Text className="text-white text-base font-bold">
                            Finalizar Visita
                        </Text>
                        <Boxicon name="bxs-check" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </Can>
            </View>

            <BottomSheet ref={bottomSheetRef} snapPoints={["85%", "95%"]}>
                <View className="px-6 pt-2 pb-8">
                    <VisitForm
                        isSyncing={isSyncing}
                        bottomSheetRef={bottomSheetRef}
                        onFinalize={handleFinalizeVisit}
                        pictures={wrappedPictures}
                        video={wrappedVideo}
                        audio={audio}
                    />
                </View>
            </BottomSheet>
        </View>
    );
}