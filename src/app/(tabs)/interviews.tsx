import { View, RefreshControl, ListRenderItem, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import InterviewCard from "@/components/InterviewCard";
import FluentEmoji from "@/components/FluentEmoji";
import { useTabBarClearance } from "@/lib/layout";
import { useGroupIndex, useGroupIndexInfinite } from "@/services/generated/apiEndpoints";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { GroupResource } from "@/services/generated/apiTypes";
import EmptyState from "@/components/EmptyState";
import { toLocalDateString, getTomorrowLocalDateString } from "@/lib/utils";

const Page = () => {
    const tabBarClearance = useTabBarClearance();
    const today = toLocalDateString();
    const tomorrow = getTomorrowLocalDateString();

    const todayInterviews = useGroupIndex({ date: today });
    const interviews = useGroupIndexInfinite({ min_date: tomorrow }, {
        query: {
            getNextPageParam: (group) => {
                const currentPage = group.meta.current_page;
                const lastPage = group.meta.last_page;
                return currentPage < lastPage ? currentPage + 1 : undefined;
            },
            initialPageParam: 1
        }
    })

    const refreshing = todayInterviews.isFetching || (interviews.isFetching && !interviews.isFetchingNextPage);

    const renderItem: ListRenderItem<GroupResource> = ({ item }) => (
        <View className="mb-3">
            <InterviewCard interview={item} />
        </View>
    );

    const ListHeaderComponent = (
        <View className="gap-6 mb-2">
            <View className="flex-row items-center gap-2">
                <FluentEmoji emoji="💬" className="text-4xl" />
                <Text className="font-bold text-gray-800 text-3xl">
                    Entrevistas
                </Text>
            </View>

            {(todayInterviews.data?.data.length ?? 0) > 0 ? (
                <View className="gap-3 mb-6">
                    {todayInterviews.data?.data.map((interview) => (
                        <InterviewCard key={interview.id} interview={interview} variant="full" />
                    ))}
                </View>
            ) : (
                <EmptyState
                    emoji="🤔"
                    title="No hay entrevistas para hoy"
                />
            )}

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500">Próximas Entrevistas</Text>
            </View>
        </View>

    );

    const ListFooterComponent = interviews.isFetchingNextPage ? (
        <View className="pt-4 pb-16 items-center">
            <ActivityIndicator size="small" color="#61b346" />
        </View>
    ) : null;

    const ListEmptyComponent = interviews.isPending ? (
        <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#61b346" />
        </View>
    ) : (
        <View className="pt-10">
            <EmptyState
                emoji="🔍"
                title="No se encontraron entrevistas"
            />
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 relative">
            <KeyboardAwareFlatList
                data={interviews.data?.pages.flatMap((page) => page.data ?? [])}
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
                    if (interviews.hasNextPage && !interviews.isFetching) {
                        interviews.fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            todayInterviews.refetch();
                            interviews.refetch();
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
