import React, { useState, useRef } from "react";
import { Image } from "expo-image";
import { View, ScrollView, TouchableOpacity, Linking, Modal, ActivityIndicator, RefreshControl, ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
    RELATIONSHIP,
    DOCUMENT,
    HOUSING_STATUS,
    LAND_SERVICES,
    FAMILY_STATUS,
} from "@/lib/enums";
import { useLocalSearchParams, useRouter } from "expo-router";
import InfoRow from "@/components/InfoRow";
import { FamilyMemberResource, DocumentResource, NoteResource, LandService } from "@/services/generated/apiTypes";
import FluentEmoji from "@/components/FluentEmoji";
import BrandBoxicon from "@/components/BrandBoxicons";
import FamilyStatusBadge from "@/components/FamilyStatusBadge";
import SectionHeader from "@/components/SectionHeader";
import Can from "@/components/Can";
import { Permission } from "@/lib/permissions";
import FilePreviewDialog from "@/components/FilePreviewDialog";
import { Badge } from "@/components/ui/badge";
import TestimonyCard from "@/components/TestimonyCard";
import NoteCard from "@/components/NoteCard";
import VisitCard from "@/components/VisitCard";
import TestimonySheet from "@/components/TestimonySheet";
import NoteSheet from "@/components/NoteSheet";
import LocationMapPreview from "@/components/LocationMapPreview";
import { parseCoordinates, getPlusCodeForCoords } from "@/lib/geo";
import EmptyState from "@/components/EmptyState";
import { useFamilyProfileShow, useNoteIndex, useTestimonyIndex, useVisitIndex } from "@/services/generated/apiEndpoints";
import { useScreenTopPadding } from "@/lib/layout";

const Page = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const topPadding = useScreenTopPadding();
    const familyId = Number(id);

    const { data: family, refetch: refetchFamily, isFetching: isFetchingFamily, isError: isFamilyError } = useFamilyProfileShow(
        familyId,
        {
            query: {
                enabled: !isNaN(familyId) && familyId > 0,
            },
        }
    );

    const notesQuery = useNoteIndex(
        { noteable_type: "family_profile", noteable_id: familyId },
        { query: { enabled: !isNaN(familyId) && familyId > 0 } }
    );
    const testimoniesQuery = useTestimonyIndex(
        { family_profile_id: familyId },
        { query: { enabled: !isNaN(familyId) && familyId > 0 } }
    );
    const visitsQuery = useVisitIndex(
        { family_profile_id: familyId },
        { query: { enabled: !isNaN(familyId) && familyId > 0 } }
    );

    const isPending = isFetchingFamily && !family;
    const isError = isFamilyError && !family;
    const isFetching = isFetchingFamily || notesQuery.isFetching || testimoniesQuery.isFetching || visitsQuery.isFetching;
    const refetch = () => {
        refetchFamily();
        notesQuery.refetch();
        testimoniesQuery.refetch();
        visitsQuery.refetch();
    };

    const [photoFullscreen, setPhotoFullscreen] = useState(false);
    const [selectedTestimony, setSelectedTestimony] = useState<any>(null);
    const [selectedNote, setSelectedNote] = useState<NoteResource | null>(null);
    const [previewDoc, setPreviewDoc] = useState<DocumentResource | null>(null);
    const testimonySheetRef = useRef<BottomSheetModal>(null);
    const noteSheetRef = useRef<BottomSheetModal>(null);

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

    if (isError || !family) {
        return (
            <View
                className="flex-1 bg-gray-100 p-6 justify-center"
                style={{ paddingTop: topPadding }}
            >
                <EmptyState
                    emoji="⚠️"
                    title="Familia no encontrada"
                    subtitle="No se pudieron cargar los detalles de este perfil."
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

    const members = family.members || [];
    const documents = family.documents || [];
    const notes = notesQuery.data?.data ?? [];
    const testimonies = testimoniesQuery.data?.data ?? [];
    const visits = visitsQuery.data?.data ?? [];

    const landCoords = parseCoordinates(
        family.land_latitude,
        family.land_longitude,
        family.land_address_link
    );

    const homeCoords = parseCoordinates(
        family.home_latitude,
        family.home_longitude,
        family.home_address_link
    );

    const landPoint = landCoords
        ? {
            type: "land" as const,
            title: "Terreno",
            address: family.land_address,
            latitude: landCoords.latitude,
            longitude: landCoords.longitude,
        }
        : null;

    const landPlusCode = landCoords
        ? getPlusCodeForCoords(landCoords.latitude, landCoords.longitude)
        : null;

    const homePoint = homeCoords
        ? {
            type: "home" as const,
            title: "Casa",
            address: family.home_address,
            latitude: homeCoords.latitude,
            longitude: homeCoords.longitude,
        }
        : null;

    const homePlusCode = homeCoords
        ? getPlusCodeForCoords(homeCoords.latitude, homeCoords.longitude)
        : null;

    const copyPlusCode = async (code: string) => {
        await Clipboard.setStringAsync(code);
        ToastAndroid.show("Plus Code copiado", ToastAndroid.SHORT);
    };

    const renderMember = (member: FamilyMemberResource) => {
        const phone = member.phone;
        const openWhatsApp = (e: any) => {
            e.stopPropagation();
            const cleanPhone = phone ? phone.replace(/[^0-9+]/g, "") : "";
            if (cleanPhone) {
                Linking.openURL(`whatsapp://send?phone=${cleanPhone}`).catch(() => {
                    Linking.openURL(`https://wa.me/${cleanPhone}`);
                });
            }
        };

        return (
            <TouchableOpacity
                key={member.id}
                className="flex-row items-center gap-4 py-1 active:opacity-70"
                onPress={() => router.push(`/family-member/${member.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${member.name}`}
            >
                <View className="h-14 w-14 rounded-2xl bg-gray-100 items-center justify-center shrink-0">
                    <Boxicon name="bxs-user" size={24} color="#9ca3af" />
                </View>
                <View className="flex-1 gap-0.5">
                    <Text className="font-bold text-gray-800 text-xl leading-tight">
                        {member.name} {member.paternal_surname}
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-gray-500 text-base font-medium">
                            {member.relationship
                                ? RELATIONSHIP[member.relationship]?.label ?? member.relationship
                                : "Familiar"}
                        </Text>
                        {member.is_responsible && (
                            <View className="bg-primary/10 px-3 py-1 rounded-full">
                                <Text className="text-primary text-sm font-bold">Responsable</Text>
                            </View>
                        )}
                    </View>
                </View>
                {phone ? (
                    <TouchableOpacity
                        className="bg-[#f0fdf4] p-3 rounded-full"
                        onPress={openWhatsApp}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Enviar mensaje de WhatsApp"
                    >
                        <BrandBoxicon name="bx-whatsapp" size={32} color="#16a34a" />
                    </TouchableOpacity>
                ) : (
                    <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
                )}
            </TouchableOpacity>
        );
    };

    const photoUrl = family.family_photo_url ?? null;

    return (
        <>
            <ScrollView
                className="flex-1 bg-gray-100"
                contentContainerClassName="p-6 pb-24 gap-6"
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
                <View className="bg-white rounded-3xl overflow-hidden shadow-md shadow-black/5">
                    <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={() => photoUrl && setPhotoFullscreen(true)}
                        disabled={!photoUrl}
                        accessibilityRole="button"
                        accessibilityLabel="Ver foto de la familia en pantalla completa"
                    >
                        {photoUrl ? (
                            <Image
                                source={{ uri: photoUrl }}
                                style={{ width: "100%", height: 256 }}
                                contentFit="cover"
                                transition={200}
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <View className="h-48 bg-gray-100 items-center justify-center gap-2">
                                <FluentEmoji emoji="📷" className="text-5xl" />
                                <Text className="text-gray-400 font-medium text-base">Sin Fotografía</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View className="p-6 gap-4">
                        <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1 gap-2">
                                <Text className="text-3xl font-bold text-gray-800 leading-tight">
                                    {family.family_name}
                                </Text>
                                <View className="flex-row items-center gap-2 flex-wrap">
                                    <FamilyStatusBadge status={family?.status ?? ""} />
                                    {family.updated_at && (
                                        <Text className="text-gray-500 text-sm font-medium">
                                            {formatDateTime(family.updated_at)}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <Can permission={Permission.familyProfileUpdate}>
                                <TouchableOpacity
                                    onPress={() => router.push(`/edit-family-profile/${family.id}`)}
                                    className="h-11 w-11 bg-primary/10 rounded-2xl items-center justify-center active:bg-primary/20"
                                    accessibilityRole="button"
                                    accessibilityLabel="Editar perfil de familia"
                                >
                                    <Boxicon name="bxs-edit" size={22} color="#61b346" />
                                </TouchableOpacity>
                            </Can>
                        </View>

                        <View className="gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-500 font-medium">Creación del perfil</Text>
                                <Text className="text-gray-800 font-bold">
                                    {family.created_at ? formatDateTime(family.created_at) : "—"}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-500 font-medium">Fecha de entrevista</Text>
                                <Text className="text-gray-800 font-bold">
                                    {family.opened_at ? formatDate(family.opened_at) : "—"}
                                </Text>
                            </View>

                            {family.interviewer_name && (
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-500 font-medium">Entrevistado por</Text>
                                    <Text className="text-gray-800 font-bold">
                                        {family.interviewer_name}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {family.responsibleMember?.phone && (
                            <TouchableOpacity
                                onPress={() =>
                                    Linking.openURL(
                                        `whatsapp://send?phone=${family.responsibleMember!.phone}`,
                                    )
                                }
                                className="flex-row items-center gap-4 bg-[#f0fdf4] rounded-2xl px-5 py-4 active:bg-green-100 border border-green-200"
                                accessibilityRole="button"
                                accessibilityLabel="Abrir WhatsApp del responsable"
                            >
                                <View className="h-12 w-12 bg-green-100 rounded-2xl items-center justify-center shrink-0">
                                    <BrandBoxicon name="bx-whatsapp" size={28} color="#16a34a" />
                                </View>
                                <View className="flex-1 gap-0.5">
                                    <Text className="text-green-800 text-sm font-medium">
                                        Responsable · {family.responsibleMember.name}
                                    </Text>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        {family.responsibleMember.phone}
                                    </Text>
                                </View>
                                <Boxicon name="bx-chevron-right" size={24} color="#16a34a" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {[FAMILY_STATUS.approved, FAMILY_STATUS.programmed, FAMILY_STATUS.built, FAMILY_STATUS.not_eligible, FAMILY_STATUS.dont_build].some((s) => s.value === family.status) && family.reason && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-2 overflow-hidden">
                        <View className="flex-row items-center gap-2">
                            <FluentEmoji emoji="📝" className="text-2xl" />
                            <Text className="text-gray-800 font-bold text-xl">Razón</Text>
                        </View>
                        <Text className="text-gray-700 text-base leading-relaxed mt-1">
                            {family.reason}
                        </Text>
                    </View>
                )}

                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4">
                    <SectionHeader
                        emoji="👥"
                        title="Integrantes"
                        action={
                            <Can permission={Permission.familyMemberCreate}>
                            <TouchableOpacity
                                className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-70"
                                onPress={() => router.push(`/new-family-member/${family.id}` as any)}
                                accessibilityRole="button"
                                accessibilityLabel="Añadir familiar"
                            >
                                <Boxicon name="bx-plus" size={16} color="#61b346" />
                                <Text className="text-primary font-bold text-sm">Añadir</Text>
                            </TouchableOpacity>
                        </Can>
                        }
                    />
                    {members.length > 0 ? (
                        <View className="gap-3">
                            {members.map(renderMember)}
                        </View>
                    ) : (
                        <Text className="text-gray-400 text-sm font-medium italic">
                            No hay integrantes registrados.
                        </Text>
                    )}
                </View>

                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="🗺️" title="Terreno" />

                    {family.land_address && (
                        <View className="flex-row items-start gap-3">
                            <View className="h-12 w-12 bg-gray-100 rounded-2xl items-center justify-center shrink-0 mt-0.5">
                                <Boxicon name="bxs-location" size={24} color="#6b7280" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-base font-medium">Dirección</Text>
                                <Text className="text-gray-800 font-bold text-lg">{family.land_address}</Text>
                                {(family.land_colony || family.land_city) && (
                                    <Text className="text-gray-500 text-base font-medium">
                                        {[family.land_colony, family.land_city].filter(Boolean).join(", ")}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {(family.land_total_cost || family.land_down_payment || family.land_monthly_payment) && (
                        <View className="gap-3">
                            {family.land_total_cost && (
                                <View className="bg-gray-50 rounded-2xl px-4 py-3 gap-0.5 border border-gray-100">
                                    <Text className="text-gray-400 text-xs font-medium">Costo Total</Text>
                                    <Text className="text-gray-800 font-bold text-lg">
                                        ${family.land_total_cost.toLocaleString()} {String(family.land_currency ?? "").toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            {(family.land_down_payment || family.land_monthly_payment) && (
                                <View className="flex-row gap-3">
                                    {family.land_down_payment && (
                                        <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 gap-0.5 border border-gray-100">
                                            <Text className="text-gray-400 text-xs font-medium">Enganch</Text>
                                            <Text className="text-gray-800 font-bold text-base">
                                                ${family.land_down_payment.toLocaleString()} {String(family.land_currency ?? "").toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    {family.land_monthly_payment && (
                                        <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 gap-0.5 border border-gray-100">
                                            <Text className="text-gray-400 text-xs font-medium">Mensual</Text>
                                            <Text className="text-gray-800 font-bold text-base">
                                                ${family.land_monthly_payment.toLocaleString()} {String(family.land_currency ?? "").toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    {landPoint && (
                        <LocationMapPreview
                            activePoint={landPoint}
                            secondaryPoint={homePoint}
                        />
                    )}

                    <View className="gap-3 mt-1">
                        {landPlusCode && (
                            <View className="flex-row items-center justify-between">
                                <InfoRow label="Plus Code" value={landPlusCode} />
                                <TouchableOpacity
                                    onPress={() => copyPlusCode(landPlusCode)}
                                    className="h-10 w-10 bg-gray-100 rounded-xl items-center justify-center active:bg-gray-200"
                                    accessibilityRole="button"
                                    accessibilityLabel="Copiar Plus Code del terreno"
                                >
                                    <Boxicon name="bx-copy" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {family.land_last_payment_date && (
                            <InfoRow label="Último Pago" value={formatDate(family.land_last_payment_date)} />
                        )}
                        {family.land_is_up_to_date !== null && (
                            <InfoRow label="Al corriente" value={family.land_is_up_to_date ? "Sí" : "No"} />
                        )}
                        {family.land_is_flat !== null && (
                            <InfoRow label="Terreno plano" value={family.land_is_flat ? "Sí" : "No"} />
                        )}
                        {family.land_size && (
                            <InfoRow label="Medidas" value={family.land_size} />
                        )}
                        {family.land_ownership_time && (
                            <InfoRow label="Tiempo de posesión" value={family.land_ownership_time} />
                        )}
                        {Array.isArray(family.land_services) && family.land_services.length > 0 && (
                            <View className="gap-2">
                                <Text className="text-gray-400 text-base font-medium">Servicios</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {(family.land_services as LandService[]).map((s) => (
                                        <View
                                            key={s}
                                            className="flex-row items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-2 rounded-full"
                                        >
                                            {LAND_SERVICES[s]?.emoji && (
                                                <FluentEmoji emoji={LAND_SERVICES[s]?.emoji!} className="text-sm" />
                                            )}
                                            <Text className="text-gray-700 font-bold text-sm">
                                                {LAND_SERVICES[s]?.label ?? s}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {!family.lives_on_land && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                        <SectionHeader emoji="🏠" title="Casa Actual" />

                        {family.home_address && (
                            <View className="flex-row items-start gap-3">
                                <View className="h-12 w-12 bg-gray-100 rounded-2xl items-center justify-center shrink-0 mt-0.5">
                                    <Boxicon name="bxs-home" size={24} color="#6b7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-base font-medium">Dirección</Text>
                                    <Text className="text-gray-800 font-bold text-lg">{family.home_address}</Text>
                                    {(family.home_colony || family.home_city) && (
                                        <Text className="text-gray-500 text-base font-medium">
                                            {[family.home_colony, family.home_city].filter(Boolean).join(", ")}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {(family.home_status || family.home_monthly_rent) && (
                            <View className="flex-row gap-3">
                                {family.home_status && (
                                    <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 gap-0.5 border border-gray-100">
                                        <Text className="text-gray-400 text-xs font-medium">Estado</Text>
                                        <View className="flex-row items-center gap-1.5">
                                            {HOUSING_STATUS[family.home_status]?.emoji && (
                                                <FluentEmoji emoji={HOUSING_STATUS[family.home_status]?.emoji!} className="text-base" />
                                            )}
                                            <Text className="text-gray-800 font-bold text-base">
                                                {HOUSING_STATUS[family.home_status]?.label ?? family.home_status}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {family.home_status === "rented" && family.home_monthly_rent && (
                                    <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 gap-0.5 border border-gray-100">
                                        <Text className="text-gray-400 text-xs font-medium">Renta / Mes</Text>
                                        <Text className="text-gray-800 font-bold text-base">
                                            ${family.home_monthly_rent.toLocaleString()} {String(family.home_monthly_rent_currency ?? "").toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {homePoint && (
                            <LocationMapPreview
                                activePoint={homePoint}
                                secondaryPoint={landPoint}
                            />
                        )}

                        <View className="gap-3 mt-1">
                            {homePlusCode && (
                                <View className="flex-row items-center justify-between">
                                    <InfoRow label="Plus Code" value={homePlusCode} />
                                    <TouchableOpacity
                                        onPress={() => copyPlusCode(homePlusCode)}
                                        className="h-10 w-10 bg-gray-100 rounded-xl items-center justify-center active:bg-gray-200"
                                        accessibilityRole="button"
                                        accessibilityLabel="Copiar Plus Code de la casa"
                                    >
                                        <Boxicon name="bx-copy" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {family.home_ownership_time && (
                                <InfoRow label="Tiempo viviendo aquí" value={family.home_ownership_time} />
                            )}
                            {family.home_owner_name && (
                                <InfoRow label="Dueño" value={family.home_owner_name} />
                            )}
                            {family.home_status === "rented" && family.home_has_receipts !== null && (
                                <InfoRow label="Tiene recibos" value={family.home_has_receipts ? "Sí" : "No"} />
                            )}
                        </View>
                    </View>
                )}

                {family.house_description && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-3 overflow-hidden">
                        <SectionHeader emoji="🏡" title="Descripción de la Casa" />
                        <Text className="text-gray-700 text-base leading-relaxed">
                            {family.house_description}
                        </Text>
                    </View>
                )}

                {family.has_addictions && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-2 overflow-hidden">
                        <View className="flex-row items-center gap-2">
                            <FluentEmoji emoji="⚠️" className="text-2xl" />
                            <Text className="text-red-600 font-bold text-xl">Adicciones</Text>
                        </View>
                        <Text className="text-gray-700 text-base leading-relaxed mt-1">
                            {family.addictions_details || "Registradas"}
                        </Text>
                    </View>
                )}

                {family.general_observations && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-2 overflow-hidden">
                        <View className="flex-row items-center gap-2">
                            <FluentEmoji emoji="💬" className="text-2xl" />
                            <Text className="text-blue-600 font-bold text-xl">Observaciones</Text>
                        </View>
                        <Text className="text-gray-700 text-base leading-relaxed mt-1">
                            {family.general_observations}
                        </Text>
                    </View>
                )}

                {[FAMILY_STATUS.approved, FAMILY_STATUS.programmed, FAMILY_STATUS.built].some((s) => s.value === family.status) && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                        <SectionHeader emoji="🏗️" title="Construcción" />

                        {family.building_team && (
                            <View className="flex-row items-center gap-3">
                                <View className="h-12 w-12 bg-gray-100 rounded-2xl items-center justify-center shrink-0">
                                    <Boxicon name="bxs-group" size={24} color="#6b7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-base font-medium">Equipo</Text>
                                    <Text className="text-gray-800 font-bold text-lg">{family.building_team}</Text>
                                </View>
                            </View>
                        )}

                        <View className="gap-3 mt-1">
                            <InfoRow
                                label="Fecha de Construcción"
                                value={family.building_start_date ? formatDate(family.building_start_date) : "—"}
                            />
                            {family.building_team_color && (
                                <InfoRow label="Color" value={family.building_team_color} />
                            )}
                            {[FAMILY_STATUS.approved, FAMILY_STATUS.programmed].some((s) => s.value === family.status) && (
                                <View className="flex-row">
                                    {family.construction_notified ? (
                                        <Badge className="bg-primary/10 border-transparent px-4 py-2 rounded-full">
                                            <Text className="text-primary font-bold text-base">Familia Notificada</Text>
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-100 border-transparent px-4 py-2 rounded-full">
                                            <Text className="text-red-700 font-bold text-base">No Notificada</Text>
                                        </Badge>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4">
                    <SectionHeader
                        emoji="📄"
                        title="Documentos"
                        action={
                            <Can permission={Permission.familyProfileUpdate}>
                                <TouchableOpacity
                                    className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-70"
                                    onPress={() => router.push(`/new-document/${family.id}?documentable_type=family_profile` as any)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Subir documento"
                                >
                                    <Boxicon name="bx-plus" size={16} color="#61b346" />
                                    <Text className="text-primary font-bold text-sm">Subir</Text>
                                </TouchableOpacity>
                            </Can>
                        }
                    />
                    {documents.length > 0 ? (
                        <View className="gap-3">
                            {documents.map((doc: DocumentResource) => (
                                <TouchableOpacity
                                    key={doc.id}
                                    className="flex-row items-center gap-4 py-1 active:opacity-70"
                                    onPress={() => setPreviewDoc(doc)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Abrir ${DOCUMENT[doc.document_type]?.label ?? doc.document_type}`}
                                >
                                    <View className="h-14 w-14 bg-gray-100 rounded-2xl items-center justify-center shrink-0">
                                        <Boxicon name="bxs-file" size={24} color="#9ca3af" />
                                    </View>
                                    <View className="flex-1 gap-0.5">
                                        <Text className="font-bold text-gray-800 text-lg">
                                            {DOCUMENT[doc.document_type]?.label ?? doc.document_type}
                                        </Text>
                                        {doc.description && (
                                            <Text className="text-gray-500 text-base font-medium" numberOfLines={1}>
                                                {doc.description}
                                            </Text>
                                        )}
                                        <Text className="text-gray-400 text-sm font-medium">
                                            {doc.original_name}
                                        </Text>
                                    </View>
                                    <Boxicon name="bx-chevron-right" size={24} color="#d1d5db" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text className="text-gray-400 text-sm font-medium italic">
                            No hay documentos registrados para esta familia.
                        </Text>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4">
                    <SectionHeader
                        emoji="🌟"
                        title="Testimonios"
                        action={
                            <Can permission={Permission.familyProfileUpdate}>
                                <TouchableOpacity
                                    className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-70"
                                    onPress={() => router.push(`/new-testimony/${family.id}`)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Añadir testimonio"
                                >
                                    <Boxicon name="bx-plus" size={16} color="#61b346" />
                                    <Text className="text-primary font-bold text-sm">Añadir</Text>
                                </TouchableOpacity>
                            </Can>
                        }
                    />
                    {testimonies.length > 0 ? (
                        <View className="gap-3">
                            {testimonies.map((testimony: any) => (
                                <TestimonyCard
                                    key={testimony.id}
                                    testimony={testimony}
                                    onPress={() => {
                                        setSelectedTestimony(testimony);
                                        testimonySheetRef.current?.present();
                                    }}
                                />
                            ))}
                        </View>
                    ) : (
                        <Text className="text-gray-400 text-sm font-medium italic">
                            No hay testimonios registrados para esta familia.
                        </Text>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4">
                    <SectionHeader
                        emoji="📝"
                        title="Notas"
                        action={
                            <Can permission={Permission.familyProfileUpdate}>
                                <TouchableOpacity
                                    className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-70"
                                    onPress={() => router.push(`/new-note/${family.id}?noteable_type=family_profile` as any)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Añadir nota"
                                >
                                    <Boxicon name="bx-plus" size={16} color="#61b346" />
                                    <Text className="text-primary font-bold text-sm">Añadir</Text>
                                </TouchableOpacity>
                            </Can>
                        }
                    />
                    {notes.length > 0 ? (
                        <View className="gap-3">
                            {notes.map((note: NoteResource) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onPress={() => {
                                        setSelectedNote(note);
                                        noteSheetRef.current?.present();
                                    }}
                                />
                            ))}
                        </View>
                    ) : (
                        <Text className="text-gray-400 text-sm font-medium italic">
                            No hay notas registradas para esta familia.
                        </Text>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4">
                    <SectionHeader emoji="📅" title="Visitas" />
                    {visits.length > 0 ? (
                        <View className="gap-3">
                            {visits.map((visit) => (
                                <VisitCard key={visit.id} visit={visit} variant="summary" familyName={family.family_name} readOnly />
                            ))}
                        </View>
                    ) : (
                        <Text className="text-gray-400 text-sm font-medium italic">
                            No hay visitas registradas para esta familia.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {photoUrl && (
                <Modal
                    visible={photoFullscreen}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => setPhotoFullscreen(false)}
                >
                    <TouchableOpacity
                        className="flex-1 bg-black items-center justify-center"
                        activeOpacity={1}
                        onPress={() => setPhotoFullscreen(false)}
                    >
                        <Image
                            source={{ uri: photoUrl }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="contain"
                            transition={200}
                            cachePolicy="memory-disk"
                            allowDownscaling
                        />
                        <TouchableOpacity
                            className="absolute top-14 right-5 h-10 w-10 bg-black/60 rounded-full items-center justify-center"
                            onPress={() => setPhotoFullscreen(false)}
                        >
                            <Boxicon name="bx-x" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            )}

            <TestimonySheet
                ref={testimonySheetRef}
                testimony={selectedTestimony}
                onDismiss={() => setSelectedTestimony(null)}
            />

            <NoteSheet
                ref={noteSheetRef}
                note={selectedNote}
                onDismiss={() => setSelectedNote(null)}
            />

            <FilePreviewDialog
                open={!!previewDoc}
                onOpenChange={(openOpen) => {
                    if (!openOpen) setPreviewDoc(null);
                }}
                file={previewDoc ? {
                        name: previewDoc.original_name,
                        uri: previewDoc.url,
                        mimeType: previewDoc.mime_type,
                    } : null}
            />
        </>
    );
};

export default Page;
