import React, { useMemo } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    ListRenderItem
} from "react-native";
import { Text } from "@/components/ui/text";
import { VisitCard } from "@/components/VisitCard";
import Boxicon from "@/components/Boxicons";
import { Visit } from "@/types/api";
import { useVisitList } from "@/hooks/useVisits";

export default function VisitsScreen() {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching
    } = useVisitList();

    const allVisits = useMemo(() => {
        return data?.pages.flatMap(page => page.data) || [];
    }, [data]);

    const today = new Date().toDateString();

    const todaysVisits = useMemo(() =>
        allVisits.filter(visit => new Date(visit.scheduled_at).toDateString() === today),
        [allVisits, today]);

    const futureVisits = useMemo(() =>
        allVisits.filter(visit => new Date(visit.scheduled_at).toDateString() !== today),
        [allVisits, today]);

    const renderItem: ListRenderItem<Visit> = ({ item }) => (
        <View className="mb-3">
            <VisitCard visit={item} variant="summary" />
        </View>
    );

    const ListHeaderComponent = () => (
        <View className="mb-4 mt-2">
            <View className="mb-6">
                <Text className="text-gray-500 text-sm">Gestión y seguimiento</Text>
                <Text variant="h3" className="font-bold text-gray-800">Visitas</Text>
            </View>

            {todaysVisits.length > 0 ? (
                <View className="gap-3 mb-6">
                    {todaysVisits.map((visit) => (
                        <VisitCard key={visit.id} visit={visit} variant="full" />
                    ))}
                </View>
            ) : (
                <View className="bg-white px-6 py-12 rounded-2xl items-center gap-2 mb-6">
                    <Boxicon name="bxs-calendar-x" size={32} color="#9ca3af" />
                    <Text className="text-gray-500">No hay visitas para hoy</Text>
                </View>
            )}

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500">Próximas Visitas</Text>
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
                <Boxicon name="bxs-calendar" size={32} color="#9ca3af" />
                <Text className="text-gray-500">No hay visitas programadas.</Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-100">
            <FlatList
                data={futureVisits}
                renderItem={renderItem}

                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}

                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                ListEmptyComponent={ListEmptyComponent}

                contentContainerClassName="p-4"
                showsVerticalScrollIndicator={false}

                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isFetchingNextPage}
                        onRefresh={refetch}
                        colors={["#61b346"]}
                    />
                }
            />
        </View>
    );
}