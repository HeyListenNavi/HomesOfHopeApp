import { View, RefreshControl, ListRenderItem, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import VisitCard from "@/components/VisitCard";
import FluentEmoji from "@/components/FluentEmoji";
import { useTabBarClearance } from "@/lib/layout";
import { useVisitIndex, useVisitIndexInfinite } from "@/services/generated/apiEndpoints";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { VisitResource, VisitStatus } from "@/services/generated/apiTypes";
import EmptyState from "@/components/EmptyState";
import { toLocalDateString, getTomorrowLocalDateString } from "@/lib/utils";

const Page = () => {
    const tabBarClearance = useTabBarClearance();
    const today = toLocalDateString();
    const tomorrow = getTomorrowLocalDateString();

    const todayVisits = useVisitIndex({ date: today, status: VisitStatus.scheduled });
    const visits = useVisitIndexInfinite({ min_date: tomorrow, status: VisitStatus.scheduled }, {
        query: {
            getNextPageParam: (visitPage) => {
                const currentPage = visitPage.meta.current_page;
                const lastPage = visitPage.meta.last_page;
                return currentPage < lastPage ? currentPage + 1 : undefined;
            },
            initialPageParam: 1
        }
    });

    const refreshing = todayVisits.isFetching || (visits.isFetching && !visits.isFetchingNextPage);

    const renderItem: ListRenderItem<VisitResource> = ({ item }) => (
        <View className="mb-3">
            <VisitCard visit={item} variant="summary" />
        </View>
    );

    const ListHeaderComponent = (
        <View className="gap-6 mb-2">
            <View className="flex-row items-center gap-2">
                <FluentEmoji emoji="🚗" className="text-4xl" />
                <Text className="font-bold text-gray-800 text-3xl">
                    Visitas
                </Text>
            </View>

            {(todayVisits.data?.data.length ?? 0) > 0 ? (
                <View className="gap-3 mb-6">
                    {todayVisits.data?.data.map((visit) => (
                        <VisitCard key={visit.id} visit={visit} variant="full" />
                    ))}
                </View>
            ) : (
                <EmptyState
                    emoji="🤔"
                    title="No hay visitas para hoy"
                />
            )}

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500">Próximas Visitas</Text>
            </View>
        </View>
    );

    const ListFooterComponent = visits.isFetchingNextPage ? (
        <View className="pt-4 pb-16 items-center">
            <ActivityIndicator size="small" color="#61b346" />
        </View>
    ) : null;

    const ListEmptyComponent = visits.isPending ? (
        <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#61b346" />
        </View>
    ) : (
        <View className="pt-10">
            <EmptyState
                emoji="🔍"
                title="No se encontraron visitas"
            />
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 relative">
            <KeyboardAwareFlatList
                data={visits.data?.pages.flatMap((page) => page.data ?? [])}
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
                    if (visits.hasNextPage && !visits.isFetching) {
                        visits.fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            todayVisits.refetch();
                            visits.refetch();
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