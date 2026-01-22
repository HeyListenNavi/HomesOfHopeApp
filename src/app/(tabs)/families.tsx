import React, { useState, useMemo } from "react";
import {
    View,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ListRenderItem
} from "react-native";
import { FamilyCard } from "@/components/FamilyCard";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";
import StatCard from "@/components/StatCard";
import Input from "@/components/Input";
import { useFamilyList } from "@/hooks/useFamilies";
import { FamilyProfile } from "@/types/api";
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';

const Page = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching
    } = useFamilyList(search);

    const allFamilies = useMemo(() => {
        return data?.pages.flatMap(page => page.data) || [];
    }, [data]);

    const renderItem: ListRenderItem<FamilyProfile> = ({ item }) => (
        <View className="mb-3">
            <FamilyCard family={item} />
        </View>
    );

    const ListHeaderComponent = (
        <View className="gap-8 mb-4">
            <View className="flex-row items-center justify-between">
                <View className="gap-1">
                    <Text className="text-gray-500 text-sm">
                        Gestión de perfiles familiares
                    </Text>
                    <Text variant="h3" className="font-bold text-gray-800">
                        Familias
                    </Text>
                </View>

                <TouchableOpacity
                    className="flex-row gap-2 bg-primary py-2 px-4 rounded-xl"
                    onPress={() => router.push("/new-family-profile/123")}
                >
                    <Text className="text-white">
                        <Boxicon name="bxs-plus" size={18} />
                    </Text>
                    <Text className="text-white text-center font-bold">
                        Añadir
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="gap-4">
                <View className="flex-row justify-between">
                    <StatCard
                        size="half"
                        value={123}
                        label="Familias"
                        iconName="bxs-group"
                        iconColor="#61b346"
                        iconBgColor="bg-[#61b346]/10"
                    />
                    <StatCard
                        size="half"
                        value={123}
                        label="Construidas"
                        iconName="bxs-check-circle"
                        iconColor="#16a34a"
                        iconBgColor="bg-green-500/10"
                    />
                </View>
                <StatCard
                    size="full"
                    value={123}
                    label="Atendidas este mes"
                    iconName="bxs-calendar-check"
                    iconColor="#2563eb"
                    iconBgColor="bg-blue-500/10"
                    trend={{
                        value: "+8",
                        label: "Este mes",
                        color: "#2563eb",
                        bgColor: "bg-blue-500/10",
                        iconName: "bxs-trending-up",
                    }}
                />
            </View>

            <View className="gap-4">
                <View className="flex-row justify-between items-center">
                    <Text variant="h3" className="font-bold text-gray-800">
                        Lista de Familias
                    </Text>
                </View>

                <View className="bg-white flex-row items-center px-4 rounded-2xl">
                    <Boxicon size={18} color="#9ca3af" name="bx-search" />
                    <Input
                        placeholder="Buscar familia..."
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
    );

    const ListFooterComponent = () => {
        if (isFetchingNextPage) {
            return (
                <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#61b346" />
                    <Text className="text-xs text-gray-400 mt-2">Cargando más...</Text>
                </View>
            );
        }
        return <View className="h-10" />;
    };

    const ListEmptyComponent = () => {
        if (isLoading) {
            return (
                <View className="items-center py-20">
                    <ActivityIndicator size="large" color="#61b346" />
                    <Text className="text-gray-400 mt-4">Cargando...</Text>
                </View>
            );
        }

        return (
            <View className="bg-white px-6 py-8 rounded-2xl items-center gap-2">
                <Boxicon name="bx-search" size={48} color="#d1d5db" />
                <Text className="text-gray-500">No se encontraron familias.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            <KeyboardAwareFlatList
                data={allFamilies}
                renderItem={renderItem}

                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}

                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                ListEmptyComponent={ListEmptyComponent}

                contentContainerClassName="p-6"
                showsVerticalScrollIndicator={false}

                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isFetchingNextPage}
                        onRefresh={refetch}
                        colors={["#61b346"]}
                    />
                }

                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
            />
        </View>
    );
};

export default Page;