import React, { useMemo } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    ListRenderItem,
    TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/text";
import { VisitCard } from "@/components/VisitCard";
import Boxicon from "@/components/Boxicons";
import { Visit } from "@/types/api";
import { useVisitList } from "@/hooks/useVisits";

export default function VisitsScreen() {
    const todayDate = new Date();

    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    const todayQuery = useVisitList({
        status: "scheduled",
        date: todayDate.toISOString().split('T')[0],
    });

    const futureQuery = useVisitList({
        status: "scheduled",
        min_date: tomorrowDate.toISOString().split('T')[0],
    });

    const todayVisits = useMemo(() => {
        return todayQuery.data?.pages.flatMap((page) => page.data) || [];
    }, [todayQuery.data]);

    const futureVisits = useMemo(() => {
        return futureQuery.data?.pages.flatMap((page) => page.data) || [];
    }, [futureQuery.data]);

    const isInitialLoading = todayQuery.isLoading || futureQuery.isLoading;

    const handleRefresh = async () => {
        await Promise.all([
            todayQuery.refetch(),
            futureQuery.refetch()
        ]);
    };

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

            {todayVisits.length > 0 ? (
                <View className="gap-3 mb-2">
                    {todayVisits.map((visit) => (
                        <VisitCard key={visit.id} visit={visit} variant="full" />
                    ))}
                </View>
            ) : (
                <View className="bg-white px-6 py-12 rounded-2xl items-center gap-2 mb-6">
                    {todayQuery.isLoading ? (
                         <ActivityIndicator size="small" color="#61b346" />
                    ) : (
                        <>
                            <Boxicon name="bxs-calendar-x" size={32} color="#9ca3af" />
                            <Text className="text-gray-500">No hay visitas para hoy</Text>
                        </>
                    )}
                </View>
            )}

            {todayQuery.hasNextPage && (
                <View className="my-6 items-center">
                    <TouchableOpacity 
                        onPress={() => todayQuery.fetchNextPage()}
                        disabled={todayQuery.isFetchingNextPage}
                        className="py-2 px-4 bg-gray-200 rounded-full"
                    >
                        {todayQuery.isFetchingNextPage ? (
                            <ActivityIndicator size="small" color="#4b5563" />
                        ) : (
                            <Text className="text-gray-600 font-medium text-sm">
                                Ver más visitas de hoy
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View className="flex-row justify-between items-center mb-4 mt-2">
                <Text className="text-gray-500">Próximas Visitas</Text>
            </View>
        </View>
    );

    const ListFooterComponent = () => {
        if (futureQuery.isFetchingNextPage) {
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
        if (isInitialLoading) {
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
                <Text className="text-gray-500">No hay visitas futuras.</Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-100">
            <FlatList
                data={futureVisits}
                renderItem={renderItem}
                
                onEndReached={() => {
                    if (futureQuery.hasNextPage) futureQuery.fetchNextPage();
                }}
                onEndReachedThreshold={0.5}

                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                ListEmptyComponent={ListEmptyComponent}

                contentContainerClassName="p-4"
                showsVerticalScrollIndicator={false}

                refreshControl={
                    <RefreshControl
                        refreshing={
                            (todayQuery.isRefetching && !todayQuery.isFetchingNextPage) || 
                            (futureQuery.isRefetching && !futureQuery.isFetchingNextPage)
                        }
                        onRefresh={handleRefresh}
                        colors={["#61b346"]}
                    />
                }
            />
        </View>
    );
}