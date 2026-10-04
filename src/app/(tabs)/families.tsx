import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    ListRenderItem,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import FamilyCard from "@/components/FamilyCard";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";
import { FamilyProfileResource } from "@/services/generated/apiTypes";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import FluentEmoji from "@/components/FluentEmoji";
import { useTabBarClearance } from "@/lib/layout";
import { useFamilyProfileIndexInfinite } from "@/services/generated/apiEndpoints";
import EmptyState from "@/components/EmptyState";
import Input from "@/components/Input";
import Can from "@/components/Can";
import { Permission } from "@/lib/permissions";

const Page = () => {
    const router = useRouter();
    const tabBarClearance = useTabBarClearance();

    const [searchQuery, setSearchQuery] = useState("");

    const families = useFamilyProfileIndexInfinite(
        { family_name: searchQuery.trim() || undefined },
        {
            query: {
                getNextPageParam: (family) => {
                    const currentPage = family.current_page;
                    const lastPage = family.last_page;
                    return currentPage < lastPage ? currentPage + 1 : undefined;
                },
                initialPageParam: 1,
            },
        }
    );

    const refreshing = families.isFetching && !families.isFetchingNextPage;

    const renderItem: ListRenderItem<FamilyProfileResource> = ({ item }) => (
        <View className="mb-3">
            <FamilyCard family={item} />
        </View>
    );

    const ListHeaderComponent = (
        <View className="gap-6 mb-6">
            <View className="flex-row items-center gap-2">
                <FluentEmoji emoji="🏠" className="text-4xl" />
                <Text className="font-bold text-gray-800 text-3xl">
                    Familias
                </Text>

                <Can permission={Permission.familyProfileCreate}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="ml-auto flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 shadow-lg shadow-primary/30"
                        onPress={() => router.push("/new-family-profile" as any)}
                        accessibilityRole="button"
                        accessibilityLabel="Crear nueva familia"
                    >
                        <Boxicon name="bxs-plus" size={18} color="white" />
                        <Text className="text-white font-bold">Crear</Text>
                    </TouchableOpacity>
                </Can>
            </View>

            <Input
                debounce
                prefix={(
                    <Text className="text-primary">
                        <Boxicon name="bx-search" size={24}/>
                    </Text>
                )}
                placeholder="Buscar familia..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                inputClassName="bg-white border-0"
            />
        </View>
    );

    const ListFooterComponent = families.isFetchingNextPage ? (
        <View className="pt-4 pb-16 items-center">
            <ActivityIndicator size="small" color="#61b346" />
        </View>
    ) : null;

    const ListEmptyComponent = families.isPending ? (
        <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#61b346" />
        </View>
    ) : (
        <View className="pt-10">
            <EmptyState
                emoji="🔍"
                title="No se encontraron familias"
                subtitle="Intenta buscar con otro nombre."
            />
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 relative">
            <KeyboardAwareFlatList
                data={families.data?.pages.flatMap((page: any) => page?.data ?? [])}
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
                    if (families.hasNextPage && !families.isFetching) {
                        families.fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={families.refetch}
                        tintColor="#61b346"
                        colors={["#61b346"]}
                    />
                }
            />
        </View>
    );
};

export default Page;