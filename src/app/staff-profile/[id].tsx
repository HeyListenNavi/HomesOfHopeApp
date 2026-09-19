import React from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import InfoRow from "@/components/InfoRow";
import SectionHeader from "@/components/SectionHeader";
import FluentEmoji from "@/components/FluentEmoji";
import RoleChip, { formatRoleLabel } from "@/components/RoleChip";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useUserShow } from "@/services/generated/apiEndpoints";
import { useScreenTopPadding } from "@/lib/layout";
import EmptyState from "@/components/EmptyState";

export default function StaffProfilePage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const topPadding = useScreenTopPadding();

    const userId = Number(id);
    const {
        data: user,
        isPending,
        isError,
        refetch,
        isFetching,
    } = useUserShow(userId, {
        query: {
            enabled: !isNaN(userId) && userId > 0,
        },
    });

    console.log(user);

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

    if (isError || !user) {
        return (
            <View
                className="flex-1 bg-gray-100 items-center justify-center p-6 gap-3"
                style={{ paddingTop: topPadding }}
            >
                <EmptyState
                    emoji="🔍"
                    title="Staff no encontrado"
                    subtitle="No se pudieron cargar los datos del miembro del personal."
                />
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-primary px-6 py-3.5 rounded-2xl mt-4 active:opacity-90"
                    accessibilityRole="button"
                    accessibilityLabel="Regresar"
                >
                    <Text className="text-white font-bold text-base">Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const rolesList = (user?.roles ?? []).map(String);

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView
                className="flex-1 bg-gray-100"
                contentContainerClassName="p-6 pb-28 gap-6"
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
                <View className="bg-white rounded-3xl p-6 shadow-md shadow-black/5 items-center gap-5 relative">
                    <TouchableOpacity
                        onPress={() => router.push(`/edit-staff-profile/${user.id}` as any)}
                        activeOpacity={0.8}
                        className="absolute top-5 right-5 h-11 w-11 bg-primary/10 rounded-2xl items-center justify-center active:bg-primary/20 z-10"
                        accessibilityRole="button"
                        accessibilityLabel="Editar Staff"
                    >
                        <Boxicon name="bxs-edit" size={22} color="#61b346" />
                    </TouchableOpacity>

                    <View className="h-24 w-24 rounded-full bg-primary/10 items-center justify-center border-2 border-primary/20 mt-1">
                        <FluentEmoji emoji="👤" className="text-5xl" />
                    </View>

                    <View className="items-center gap-2">
                        <Text className="text-2xl font-bold text-gray-800 text-center leading-tight">
                            {user.name}
                        </Text>

                        {}
                        {rolesList.length > 0 && (
                            <View className="flex-row items-center justify-center gap-2 flex-wrap">
                                {rolesList.map((role, idx) => (
                                    <RoleChip key={idx} role={role} />
                                ))}
                            </View>
                        )}
                    </View>

                    {}
                    <View className="w-full pt-4 border-t border-gray-100 flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => Linking.openURL(`mailto:${user.email}`)}
                            className="flex-1 bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                            accessibilityRole="button"
                            accessibilityLabel={`Enviar correo a ${user.email}`}
                        >
                            <Boxicon name="bxs-envelope" size={20} color="#ffffff" />
                            <Text className="text-white font-bold text-base">Enviar Correo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="👤" title="Información General" />
                    <View className="gap-3">
                        <InfoRow label="Correo Electrónico" value={user.email} />
                        <InfoRow
                            label="Fecha de Registro"
                            value={user.created_at ? formatDate(user.created_at) : "No registrada"}
                        />
                    </View>
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="🛡️" title="Roles y Accesos" />
                    <View className="gap-3">
                        <InfoRow
                            label="ID de Usuario"
                            value={`#${user.id}`}
                        />
                        <InfoRow
                            label="Roles Asignados"
                            value={rolesList.length > 0 ? rolesList.map((r) => formatRoleLabel(r)).join(", ") : "Sin roles asignados"}
                        />
                        {user.updated_at && (
                            <InfoRow
                                label="Última Actualización"
                                value={formatDateTime(user.updated_at)}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
