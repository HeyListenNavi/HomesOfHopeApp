import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    ListRenderItem,
    TextInput,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import StaffCard from "@/components/StaffCard";
import { useRouter } from "expo-router";
import { UserResource } from "@/services/generated/apiTypes";
import FluentEmoji from "@/components/FluentEmoji";
import { useTabBarClearance } from "@/lib/layout";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { useRoleIndex, useUserIndexInfinite } from "@/services/generated/apiEndpoints";
import EmptyState from "@/components/EmptyState";
import Can from "@/components/Can";
import { Permission } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";

const Page = () => {
    const router = useRouter();
    const tabBarClearance = useTabBarClearance();
    const { can } = usePermissions();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const users = useUserIndexInfinite(
        { name: searchQuery.trim() || undefined, role: selectedRole ?? undefined },
        {
            query: {
                getNextPageParam: (userPage) => {
                    const currentPage = userPage.meta.current_page;
                    const lastPage = userPage.meta.last_page;
                    return currentPage < lastPage ? currentPage + 1 : undefined;
                },
                initialPageParam: 1,
            }
        }
    );
    const roles = useRoleIndex({}, {
        query: { enabled: can(Permission.roleViewAny) },
    });

    const refreshing = (users.isFetching && !users.isFetchingNextPage) || roles.isFetching;

    const renderItem: ListRenderItem<UserResource> = ({ item }) => (
        <View className="mb-3">
            <StaffCard user={item} />
        </View>
    );

    const ListHeaderComponent = (
        <View className="gap-6 mb-6">
            {}
            <View className="flex-row items-center gap-2">
                <FluentEmoji emoji="🤝" className="text-4xl" />
                <Text className="font-bold text-gray-800 text-3xl">
                    Equipo
                </Text>

                <Can permission={Permission.userCreate}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="ml-auto flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 shadow-lg shadow-primary/30"
                        onPress={() => router.push("/new-staff-profile" as any)}
                        accessibilityRole="button"
                        accessibilityLabel="Crear nuevo integrante de staff"
                    >
                        <Boxicon name="bxs-plus" size={18} color="white" />
                        <Text className="text-white font-bold">Crear</Text>
                    </TouchableOpacity>
                </Can>
            </View>

            {}
            <View className="bg-white flex-row items-center px-4 h-[60px] rounded-2xl shadow-sm shadow-black/5">
                <Boxicon size={20} color="#9ca3af" name="bx-search" />
                <TextInput
                    placeholder="Buscar por nombre o correo..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-base text-gray-800"
                    clearButtonMode="while-editing"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchQuery("")}
                        className="p-2"
                        accessibilityRole="button"
                        accessibilityLabel="Limpiar búsqueda"
                    >
                        <Boxicon name="bxs-x-circle" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            {}
            <Can permission={Permission.roleViewAny}>
                <ScrollView
                    horizontal
                    nestedScrollEnabled={true}
                    directionalLockEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    className="-mx-6"
                    contentContainerClassName="px-6 gap-3 py-1"
                >
                <TouchableOpacity
                    onPress={() => setSelectedRole(null)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    className={`flex-row items-center gap-2.5 px-5 py-3.5 rounded-2xl ${selectedRole === null
                        ? "bg-primary shadow-md shadow-primary/30"
                        : "bg-white shadow-sm shadow-black/5 active:bg-gray-50"
                        }`}
                >
                    <Text
                        className={`font-bold text-base ${selectedRole === null ? "text-white" : "text-gray-700"
                            }`}
                    >
                        Todos
                    </Text>
                </TouchableOpacity>

                {roles.data?.map((role) => {
                    return (
                        <TouchableOpacity
                            key={role.id}
                            onPress={() => setSelectedRole(role.name)}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            className={`flex-row items-center gap-2.5 px-5 py-3.5 rounded-2xl ${selectedRole == role.name
                                ? "bg-primary shadow-md shadow-primary/30"
                                : "bg-white shadow-sm shadow-black/5 active:bg-gray-50"
                                }`}
                        >
                            <Text
                                className={`font-bold text-base ${selectedRole == role.name ? "text-white" : "text-gray-700"
                                    }`}
                            >
                                {role.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
                </ScrollView>
            </Can>
        </View>
    );

    const ListFooterComponent = users.isFetchingNextPage ? (
        <View className="pt-4 pb-16 items-center">
            <ActivityIndicator size="small" color="#61b346" />
        </View>
    ) : null;

    const ListEmptyComponent = users.isPending ? (
        <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#61b346" />
        </View>
    ) : (
        <View className="pt-10">
            <EmptyState
                emoji="🔍"
                title="No se encontraron integrantes"
                subtitle={
                    searchQuery
                        ? `No hay coincidencias para "${searchQuery}".`
                        : "No hay integrantes en este rol seleccionado."
                }
            />
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 relative">
            <KeyboardAwareFlatList
                data={users.data?.pages.flatMap((page) => page.data ?? [])}
                renderItem={renderItem}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                ListFooterComponent={ListFooterComponent}
                contentContainerClassName="p-6"
                contentContainerStyle={{ paddingBottom: tabBarClearance }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                onEndReached={() => {
                    if (users.hasNextPage && !users.isFetching) {
                        users.fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            users.refetch();
                            roles.refetch();
                        }}
                        tintColor="#61b346"
                        colors={["#61b346"]}
                    />
                }
            />
        </View>
    );
};

export default Page;