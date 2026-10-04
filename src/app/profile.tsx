import React, { useRef, useEffect } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/authStore";
import { useScreenTopPadding } from "@/lib/layout";
import FluentEmoji from "@/components/FluentEmoji";
import SectionHeader from "@/components/SectionHeader";
import InfoRow from "@/components/InfoRow";
import RoleChip, { formatRoleLabel } from "@/components/RoleChip";
import { formatDate } from "@/lib/utils";
import BottomSheet from "@/components/BottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useGetUser, useAuthLogout } from "@/services/generated/apiEndpoints";
import { queryClient } from "@/lib/queryClient";
import EmptyState from "@/components/EmptyState";

export default function ProfilePage() {
    const router = useRouter();
    const authStore = useAuthStore();
    const topPadding = useScreenTopPadding();
    const logoutSheetRef = useRef<BottomSheetModal>(null);

    const {
        data: backendUser,
        isPending,
        isError,
        refetch,
        isFetching,
    } = useGetUser();

    const logoutMutation = useAuthLogout();

    
    useEffect(() => {
        if (backendUser) {
            authStore.setUser(backendUser);
        }
    }, [backendUser]);

    const user = backendUser ?? authStore.user;

    const handleOpenLogout = () => {
        logoutSheetRef.current?.present();
    };

    const handleConfirmLogout = async () => {
        logoutSheetRef.current?.dismiss();
        try {
            await logoutMutation.mutateAsync();
        } catch (e) {
            console.log("Backend logout error:", e);
        } finally {
            authStore.logout();
            queryClient.clear();
            router.replace("/login");
        }
    };

    if (isPending && !user) {
        return (
            <View
                className="flex-1 bg-gray-100 items-center justify-center"
                style={{ paddingTop: topPadding }}
            >
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    if (isError && !user) {
        return (
            <View
                className="flex-1 bg-gray-100 items-center justify-center p-6 gap-3"
                style={{ paddingTop: topPadding }}
            >
                <EmptyState
                    emoji="⚠️"
                    title="Error al cargar perfil"
                    subtitle="No se pudieron obtener los datos de la cuenta."
                />
                <TouchableOpacity
                    onPress={() => refetch()}
                    className="bg-primary px-6 py-3.5 rounded-2xl mt-4 active:opacity-90"
                    accessibilityRole="button"
                    accessibilityLabel="Reintentar"
                >
                    <Text className="text-white font-bold text-base">Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const rolesList: string[] = (user?.roles ?? []).map(String);

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
                    <View className="h-24 w-24 rounded-full bg-primary/10 items-center justify-center border-2 border-primary/20 mt-1">
                        <FluentEmoji emoji="👤" className="text-5xl" />
                    </View>

                    <View className="items-center gap-2">
                        <Text className="text-2xl font-bold text-gray-800 text-center leading-tight">
                            {user?.name ?? "Usuario"}
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
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="👤" title="Información de la Cuenta" />
                    <View className="gap-3">
                        <InfoRow label="Nombre Completo" value={user?.name ?? "—"} />
                        <InfoRow label="Correo Electrónico" value={user?.email ?? "—"} />
                        <InfoRow
                            label="Roles Asignados"
                            value={rolesList.length > 0 ? rolesList.map((r) => formatRoleLabel(r)).join(", ") : "Sin roles asignados"}
                        />
                        <InfoRow
                            label="Miembro Desde"
                            value={user?.created_at ? formatDate(user.created_at) : "No registrada"}
                        />
                        <InfoRow label="ID de Usuario" value={`#${user?.id ?? "—"}`} />
                    </View>
                </View>

                {}
                <TouchableOpacity
                    className="flex-row items-center gap-4 bg-white border border-red-200 rounded-3xl p-5 shadow-md shadow-black/5 active:bg-red-50"
                    onPress={handleOpenLogout}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar Sesión"
                >
                    <View className="w-12 h-12 rounded-2xl bg-red-100 items-center justify-center shrink-0">
                        <Boxicon
                            name="bxs-arrow-in-left-square-half"
                            size={24}
                            color="#dc2626"
                        />
                    </View>
                    <View className="gap-0.5">
                        <Text className="font-bold text-red-600 text-lg">
                            Cerrar Sesión
                        </Text>
                        <Text className="text-gray-400 text-sm font-medium">
                            Finalizar la sesión actual en este dispositivo
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {}
            <BottomSheet
                ref={logoutSheetRef}
                scrollable={false}
            >
                <View className="px-6 pb-6 gap-6 pt-2 items-center">
                    <View className="w-20 h-20 rounded-3xl bg-red-100 items-center justify-center">
                        <Boxicon
                            name="bxs-arrow-in-left-square-half"
                            size={38}
                            color="#dc2626"
                        />
                    </View>

                    <View className="items-center gap-1.5">
                        <Text className="font-black text-gray-800 text-2xl text-center leading-tight">
                            ¿Cerrar Sesión?
                        </Text>
                        <Text className="text-gray-500 text-base font-medium text-center leading-relaxed">
                            ¿Estás seguro de que deseas salir de tu cuenta en este dispositivo?
                        </Text>
                    </View>

                    <View className="w-full gap-3 mt-2">
                        <TouchableOpacity
                            onPress={handleConfirmLogout}
                            activeOpacity={0.85}
                            disabled={logoutMutation.isPending}
                            className="w-full h-14 bg-red-600 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:opacity-90"
                            accessibilityRole="button"
                            accessibilityLabel="Confirmar Cerrar Sesión"
                        >
                            {logoutMutation.isPending ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <>
                                    <Boxicon
                                        name="bxs-arrow-in-left-square-half"
                                        size={22}
                                        color="#ffffff"
                                    />
                                    <Text className="text-white font-bold text-lg">
                                        Cerrar Sesión
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => logoutSheetRef.current?.dismiss()}
                            activeOpacity={0.85}
                            disabled={logoutMutation.isPending}
                            className="w-full h-14 bg-gray-100 rounded-2xl items-center justify-center active:bg-gray-200"
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar"
                        >
                            <Text className="text-gray-700 font-bold text-base">
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>
        </View>
    );
}
