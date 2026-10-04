import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import {
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    ToastAndroid,
    Modal,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EvidenceResource, TaskResource } from "@/services/generated/apiTypes";
import { useScreenTopPadding } from "@/lib/layout";
import { Badge } from "@/components/ui/badge";
import FluentEmoji from "@/components/FluentEmoji";
import SectionHeader from "@/components/SectionHeader";
import { formatDate, formatDateTime } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { useVisitShow } from "@/services/generated/apiEndpoints";
import { useVideoPlayer, VideoView } from "expo-video";
import AudioPlayer from "@/components/AudioPlayer";
import FilePreviewDialog from "@/components/FilePreviewDialog";
import { TASK_STATUS, VISIT_STATUS } from "@/lib/enums";

const getMediaType = (
    evidence: EvidenceResource
): "image" | "video" | "audio" | "other" => {
    const desc = evidence.description?.toLowerCase() || "";
    if (desc.includes("audio") || desc.includes("conclusiones") || desc.includes("voz")) return "audio";
    if (desc.includes("video") || desc.includes("recorrido")) return "video";
    if (desc.includes("foto") || desc.includes("fotografía") || desc.includes("imagen")) return "image";

    const mime = evidence.mime_type?.toLowerCase() || "";
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";

    const url = evidence.url?.toLowerCase() || "";
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) return "image";
    if (/\.(mp4|mov|webm|m4v)$/i.test(url)) return "video";
    if (/\.(m4a|mp3|wav|aac|ogg)$/i.test(url)) return "audio";

    return "other";
};

const VideoPlayerModal = ({
    videoUrl,
    onClose,
}: {
    videoUrl: string | null;
    onClose: () => void;
}) => {
    const player = useVideoPlayer(videoUrl ?? "", (p) => {
        p.loop = false;
        p.play();
    });

    if (!videoUrl) return null;

    return (
        <Modal
            visible={!!videoUrl}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/95 justify-center items-center p-4 relative"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    className="absolute top-14 right-6 z-20 h-10 w-10 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar video"
                >
                    <Boxicon name="bx-x" size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation?.()}
                    className="w-[90%] max-h-[82%] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl justify-center items-center"
                >
                    <VideoView
                        player={player}
                        style={{ width: "100%", height: "100%" }}
                        fullscreenOptions={{ enable: true }}
                        allowsPictureInPicture
                        nativeControls
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const PhotoModal = ({
    photoUrl,
    onClose,
}: {
    photoUrl: string | null;
    onClose: () => void;
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (photoUrl) {
            console.log("[Opening Photo URL]:", photoUrl);
            setIsLoading(true);
            setHasError(false);
        }
    }, [photoUrl, retryCount]);

    if (!photoUrl) return null;

    return (
        <Modal
            visible={!!photoUrl}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/95 justify-center items-center relative"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    className="absolute top-14 right-5 z-20 h-10 w-10 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar foto"
                >
                    <Boxicon name="bx-x" size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[92%] h-[85%] justify-center items-center"
                    activeOpacity={1}
                    onPress={onClose}
                >
                    {isLoading && !hasError && (
                        <View className="absolute z-10">
                            <ActivityIndicator size="large" color="#61b346" />
                        </View>
                    )}

                    {hasError ? (
                        <View className="bg-gray-900/80 p-6 rounded-3xl items-center gap-3 border border-gray-700">
                            <Boxicon name="bx-alert-circle" size={36} color="#ef4444" />
                            <Text className="text-white font-bold text-base text-center">
                                No se pudo cargar la imagen
                            </Text>
                            <Text className="text-gray-400 text-xs text-center px-4" numberOfLines={2}>
                                {photoUrl}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setHasError(false);
                                    setIsLoading(true);
                                    setRetryCount((c) => c + 1);
                                }}
                                className="bg-primary px-5 py-2.5 rounded-full mt-2"
                            >
                                <Text className="text-white font-bold text-sm">Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Image
                            key={`${photoUrl}-${retryCount}`}
                            source={{ uri: photoUrl }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="contain"
                            transition={200}
                            cachePolicy="memory-disk"
                            allowDownscaling
                            onLoadStart={() => setIsLoading(true)}
                            onLoad={() => setIsLoading(false)}
                            onError={(e) => {
                                console.warn("[Photo Load Error]:", photoUrl, e.error);
                                setIsLoading(false);
                                setHasError(true);
                            }}
                        />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const AudioPlayerModal = ({
    audioItem,
    onClose,
}: {
    audioItem: { url: string; title?: string } | null;
    onClose: () => void;
}) => {
    if (!audioItem) return null;

    return (
        <Modal
            visible={!!audioItem}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/60 justify-center items-center p-6"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation?.()}
                    className="w-full bg-white rounded-3xl p-6 gap-4 shadow-2xl"
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                            <View className="h-10 w-10 bg-amber-100 rounded-xl items-center justify-center">
                                <Boxicon name="bxs-microphone" size={20} color="#d97706" />
                            </View>
                            <Text className="text-xl font-bold text-gray-800 flex-1" numberOfLines={1}>
                                {audioItem.title || "Audio de Evidencia"}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="h-9 w-9 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
                        >
                            <Boxicon name="bx-x" size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <AudioPlayer uri={audioItem.url} />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default function VisitViewPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const topPadding = useScreenTopPadding();
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [selectedAudio, setSelectedAudio] = useState<{ url: string; title?: string } | null>(null);
    const [previewFile, setPreviewFile] = useState<{ name: string; uri: string; mimeType?: string | null } | null>(null);

    const visitId = Number(id);
    const { data: visit, isPending, isError, refetch, isFetching } = useVisitShow(
        visitId,
        {
            query: {
                enabled: !isNaN(visitId) && visitId > 0,
            },
        }
    );

    const responsible_member = visit?.family_profile?.responsible_member;
    const familyPhoto = visit?.family_profile?.family_photo_url;

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

    const evidences: EvidenceResource[] = visit.evidences || [];

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-6 pb-10 gap-6"
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
                {}
                <TouchableOpacity
                    className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden active:opacity-90"
                    onPress={() =>
                        visit.family_profile_id &&
                        router.push(`/family-profile/${visit.family_profile_id}`)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Ver perfil de ${visit.family_profile?.family_name ?? "Sin nombre"}`}
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
                                {visit.family_profile?.family_name ?? "Sin nombre"}
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

                {}
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

                {}
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

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-4">
                    <SectionHeader emoji="📅" title="Visita" />

                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 gap-0.5">
                            <Text className="text-gray-400 text-base font-medium">Fecha agendada</Text>
                            <Text className="text-gray-800 font-bold text-lg">
                                {formatDateTime(visit.scheduled_at)}
                            </Text>
                        </View>
                        <Badge
                            className={
                                visit.status === "completed"
                                    ? "bg-green-100 border-transparent px-3 py-1.5 rounded-full"
                                    : "bg-blue-100 border-transparent px-3 py-1.5 rounded-full"
                            }
                        >
                            <Text
                                className={
                                    visit.status === "completed"
                                        ? "text-green-700 text-sm font-bold"
                                        : "text-blue-700 text-sm font-bold"
                                }
                            >
                                {VISIT_STATUS[visit.status]?.label ?? visit.status}
                            </Text>
                        </Badge>
                    </View>

                    <View className="gap-3 border-t border-gray-100 pt-4">
                        {visit.completed_at && (
                            <View className="flex-col gap-1">
                                <Text className="text-gray-400 text-base font-medium">Completada el</Text>
                                <Text className="text-gray-800 font-bold">
                                    {formatDateTime(visit.completed_at)}
                                </Text>
                            </View>
                        )}
                        {visit.created_at && (
                            <View className="flex-col gap-1">
                                <Text className="text-gray-400 text-base font-medium">Registrada el</Text>
                                <Text className="text-gray-800 font-bold">
                                    {formatDateTime(visit.created_at)}
                                </Text>
                            </View>
                        )}
                        {visit.updated_at && (
                            <View className="flex-col gap-1">
                                <Text className="text-gray-400 text-base font-medium">Actualizada el</Text>
                                <Text className="text-gray-800 font-bold">
                                    {formatDateTime(visit.updated_at)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {}
                {visit.outcome_summary ? (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-3">
                        <SectionHeader emoji="📋" title="Instrucciones" />
                        <Text className="text-gray-700 leading-relaxed text-base">
                            {visit.outcome_summary}
                        </Text>
                    </View>
                ) : null}

                {}
                {visit.tasks && visit.tasks.length > 0 ? (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-4">
                        <SectionHeader emoji="✅" title="Tareas" />

                        <View className="gap-3">
                            {visit.tasks.map((task: TaskResource) => {
                                const style = TASK_STATUS[task.status] ?? TASK_STATUS.pending;
                                return (
                                    <View
                                        key={task.id}
                                        className="flex-row items-center gap-4 px-4 py-4 rounded-2xl bg-gray-100"
                                    >
                                        <Boxicon
                                            name={style.icon}
                                            size={24}
                                            color={style.color}
                                        />
                                        <View className="flex-1 gap-1">
                                            <Text className="font-bold text-gray-800 text-base">
                                                {task.title}
                                            </Text>
                                            {task.description ? (
                                                <Text className="text-gray-500 text-sm leading-relaxed">
                                                    {task.description}
                                                </Text>
                                            ) : null}
                                            <View className="flex-row items-center gap-2 mt-0.5">
                                                <Badge
                                                    className={
                                                        task.status === "completed"
                                                            ? "bg-green-100 border-transparent px-2.5 py-0.5 rounded-full"
                                                            : task.status === "in_progress"
                                                                ? "bg-amber-100 border-transparent px-2.5 py-0.5 rounded-full"
                                                                : "bg-gray-200 border-transparent px-2.5 py-0.5 rounded-full"
                                                    }
                                                >
                                                    <Text
                                                        className={
                                                            task.status === "completed"
                                                                ? "text-green-700 text-sm font-bold"
                                                                : task.status === "in_progress"
                                                                    ? "text-amber-700 text-sm font-bold"
                                                                    : "text-gray-600 text-sm font-bold"
                                                        }
                                                    >
                                                        {TASK_STATUS[task.status]?.label ?? task.status}
                                                    </Text>
                                                </Badge>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ) : null}

                {}
                {visit.notes && visit.notes.length > 0 ? (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-4">
                        <SectionHeader emoji="📝" title="Notas" />
                        <View className="gap-4">
                            {visit.notes.map((note: any) => (
                                <View key={note.id} className="gap-1.5">
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-gray-800 font-bold text-base">
                                            {note.author?.name ?? "Sin autor"}
                                        </Text>
                                        <Text className="text-gray-400 text-base font-medium">
                                            · {formatDate(note.created_at)}
                                        </Text>
                                        {note.is_private && (
                                            <Badge className="bg-gray-100 border-transparent px-2.5 py-0.5 rounded-full">
                                                <Text className="text-gray-500 text-sm font-bold">Privada</Text>
                                            </Badge>
                                        )}
                                    </View>
                                    <Text className="text-gray-700 text-base leading-relaxed">
                                        {note.content}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {}
                {evidences.length > 0 && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-4">
                        <SectionHeader emoji="📁" title="Evidencias" />
                        <View className="gap-3">
                            {evidences.map((item) => {
                                const type = getMediaType(item);
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        className="flex-row items-center gap-4 py-2 active:opacity-70"
                                        onPress={() => {
                                            if (type === "image") {
                                                setSelectedPhoto(item.url);
                                            } else if (type === "video") {
                                                setSelectedVideo(item.url);
                                            } else if (type === "audio") {
                                                setSelectedAudio({
                                                    url: item.url,
                                                    title: item.description || "Audio de Evidencia",
                                                });
                                            } else if (item.url) {
                                                setPreviewFile({
                                                    name: item.description || "Evidencia",
                                                    uri: item.url,
                                                    mimeType: item.mime_type,
                                                });
                                            }
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Ver evidencia: ${item.description || item.url}`}
                                    >
                                        {type === "image" ? (
                                            <View className="h-16 w-16 bg-gray-100 rounded-2xl items-center justify-center shrink-0 overflow-hidden relative">
                                                <Image
                                                    source={{ uri: item.url }}
                                                    style={{ width: "100%", height: "100%" }}
                                                    contentFit="cover"
                                                    transition={200}
                                                    cachePolicy="memory-disk"
                                                />
                                                <View className="absolute bottom-1 right-1 bg-black/60 rounded-md p-1">
                                                    <Boxicon name="bxs-camera" size={12} color="#ffffff" />
                                                </View>
                                            </View>
                                        ) : type === "video" ? (
                                            <View className="h-16 w-16 bg-indigo-50 rounded-2xl items-center justify-center shrink-0">
                                                <Boxicon name="bxs-video" size={26} color="#6366f1" />
                                            </View>
                                        ) : type === "audio" ? (
                                            <View className="h-16 w-16 bg-amber-50 rounded-2xl items-center justify-center shrink-0">
                                                <Boxicon name="bxs-microphone" size={26} color="#d97706" />
                                            </View>
                                        ) : (
                                            <View className="h-16 w-16 bg-gray-100 rounded-2xl items-center justify-center shrink-0">
                                                <Boxicon name="bxs-file" size={26} color="#9ca3af" />
                                            </View>
                                        )}

                                        <View className="flex-1 gap-1">
                                            <View className="flex-row items-center gap-2">
                                                <Badge
                                                    className={
                                                        type === "image"
                                                            ? "bg-blue-100 border-transparent px-2 py-0.5 rounded-full"
                                                            : type === "video"
                                                                ? "bg-indigo-100 border-transparent px-2 py-0.5 rounded-full"
                                                                : type === "audio"
                                                                    ? "bg-amber-100 border-transparent px-2 py-0.5 rounded-full"
                                                                    : "bg-gray-100 border-transparent px-2 py-0.5 rounded-full"
                                                    }
                                                >
                                                    <View className="flex-row items-center gap-1">
                                                        <FluentEmoji
                                                            emoji={
                                                                type === "image"
                                                                    ? "📷"
                                                                    : type === "video"
                                                                        ? "🎥"
                                                                        : type === "audio"
                                                                            ? "🎙️"
                                                                            : "📄"
                                                            }
                                                            className={`text-xs ${
                                                                type === "image"
                                                                    ? "text-blue-700"
                                                                    : type === "video"
                                                                        ? "text-indigo-700"
                                                                        : type === "audio"
                                                                            ? "text-amber-700"
                                                                            : "text-gray-600"
                                                            }`}
                                                        />
                                                        <Text
                                                            className={
                                                                type === "image"
                                                                    ? "text-blue-700 text-xs font-bold"
                                                                    : type === "video"
                                                                        ? "text-indigo-700 text-xs font-bold"
                                                                        : type === "audio"
                                                                            ? "text-amber-700 text-xs font-bold"
                                                                            : "text-gray-600 text-xs font-bold"
                                                            }
                                                        >
                                                            {type === "image"
                                                                ? "Foto"
                                                                : type === "video"
                                                                    ? "Video"
                                                                    : type === "audio"
                                                                        ? "Audio"
                                                                        : "Archivo"}
                                                        </Text>
                                                    </View>
                                                </Badge>
                                                {item.created_at && (
                                                    <Text className="text-gray-400 text-xs font-medium">
                                                        {formatDate(item.created_at)}
                                                    </Text>
                                                )}
                                            </View>

                                            <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>
                                                {item.description ||
                                                    (type === "image"
                                                        ? "Fotografía"
                                                        : type === "video"
                                                            ? "Video Recorrido"
                                                            : type === "audio"
                                                                ? "Conclusiones"
                                                                : "Evidencia")}
                                            </Text>
                                        </View>

                                        <Boxicon
                                            name={type === "audio" || type === "video" ? "bxs-play" : "bx-fullscreen"}
                                            size={20}
                                            color="#9ca3af"
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>

            {}
            <PhotoModal
                photoUrl={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />

            {}
            <VideoPlayerModal
                videoUrl={selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />

            {}
            <AudioPlayerModal
                audioItem={selectedAudio}
                onClose={() => setSelectedAudio(null)}
            />

            <FilePreviewDialog
                open={!!previewFile}
                onOpenChange={(isOpen) => {
                    if (!isOpen) setPreviewFile(null);
                }}
                file={previewFile}
            />
        </View>
    );
}