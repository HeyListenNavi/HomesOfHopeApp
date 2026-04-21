import { View, TouchableOpacity, ActivityIndicator, RefreshControl, FlatList } from "react-native";
import React, { useMemo, useState } from "react";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { StaffCard } from "@/components/StaffCard";
import StatCard from "@/components/StatCard";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import Input from "@/components/Input";
import { useUserList } from "@/hooks/useUsers";
import { User } from "@/types/api";

const Page = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const params = useMemo(() => (search.trim() ? { name: search.trim() } : {}), [search]);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = useUserList(params);

    const allUsers = useMemo(() => {
        return data?.pages.flatMap((page) => page.data) || [];
    }, [data]);

    const totalUsers = data?.pages[0]?.total ?? 0;

    const toStaffShape = (user: User) => ({
        id: String(user.id),
        name: user.name,
        role: "Staff",
        phoneNumber: "",
        email: user.email,
        photoUrl: undefined,
    });

    return (
        <FlatList
            data={allUsers}
            keyExtractor={(item) => String(item.id)}
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-6"
            showsVerticalScrollIndicator={false}

            onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
            onEndReachedThreshold={0.5}

            refreshControl={
                <RefreshControl
                    refreshing={isRefetching && !isFetchingNextPage}
                    onRefresh={refetch}
                    colors={["#61b346"]}
                />
            }

            ListHeaderComponent={() => (
                <View className="gap-6">
                    <View className="flex-row items-start justify-between">
                        <View className="gap-1">
                            <Text className="text-gray-500 text-sm">
                                Gestiona a los miembros del staff
                            </Text>
                            <Text variant="h3" className="font-bold text-gray-800">
                                Equipo
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="flex-row gap-2 bg-primary/90 py-2 px-4 rounded-xl items-center"
                            onPress={() => router.push("/new-staff-profile/123")}
                        >
                            <Boxicon name="bxs-plus" size={18} color="white" />
                            <Text className="text-white font-bold">Añadir</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-4">
                        <StatCard
                            size="half"
                            value={totalUsers}
                            label="Miembros"
                            iconName="bxs-group"
                            iconColor="#61b346"
                            iconBgColor="bg-primary/10"
                        />
                        <StatCard
                            size="half"
                            value={totalUsers}
                            label="Activos"
                            iconName="bxs-check-circle"
                            iconColor="#16a34a"
                            iconBgColor="bg-green-500/10"
                        />
                    </View>

                    <View className="gap-4">
                        <View className="flex-row justify-between items-center">
                            <Text variant="h3" className="font-bold text-gray-800">
                                Miembros del Equipo
                            </Text>
                            <Button
                                variant="link"
                                onPress={() => refetch()}
                            >
                                <Text>Actualizar</Text>
                            </Button>
                        </View>

                        <View className="bg-white flex-row items-center px-4 rounded-2xl">
                            <Boxicon size={18} color="#9ca3af" name="bx-search" />
                            <Input
                                placeholder="Buscar por nombre..."
                                debounce={true}
                                debounceDelay={500}
                                onChangeText={setSearch}
                                value={search}
                                className="flex-1"
                                inputClassName="bg-white"
                            />
                        </View>
                    </View>
                </View>
            )}

            ListEmptyComponent={() => {
                if (isLoading) {
                    return (
                        <View className="items-center py-20">
                            <ActivityIndicator size="large" color="#61b346" />
                            <Text className="text-gray-400 mt-4">Cargando...</Text>
                        </View>
                    );
                }
                if (isError) {
                    return (
                        <View className="bg-white p-8 rounded-2xl items-center gap-3">
                            <Boxicon name="bxs-x-circle" size={32} color="#ef4444" />
                            <Text className="text-gray-700 font-semibold">
                                Error al cargar el equipo
                            </Text>
                        </View>
                    );
                }
                return (
                    <View className="bg-white p-8 rounded-2xl items-center gap-3">
                        <View className="bg-gray-100 p-4 rounded-full">
                            <Boxicon name="bxs-user-x" size={32} color="#9ca3af" />
                        </View>
                        <Text className="text-gray-700 font-semibold">
                            No hay personal registrado
                        </Text>
                        <Text className="text-gray-400 text-center text-sm leading-5">
                            Agrega miembros del equipo para comenzar.
                        </Text>
                    </View>
                );
            }}

            ListFooterComponent={() => {
                if (isFetchingNextPage) {
                    return (
                        <View className="py-6 items-center">
                            <ActivityIndicator size="small" color="#61b346" />
                            <Text className="text-xs text-gray-400 mt-2">Cargando más...</Text>
                        </View>
                    );
                }
                return <View className="h-10" />;
            }}

            renderItem={({ item }) => (
                <View className="mb-3">
                    <StaffCard staff={toStaffShape(item)} />
                </View>
            )}
        />
    );
};

export default Page;
