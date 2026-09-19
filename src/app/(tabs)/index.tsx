import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import StatCard from "@/components/StatCard";
import VisitCard from "@/components/VisitCard";
import InterviewCard from "@/components/InterviewCard";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import { useTabBarClearance } from "@/lib/layout";
import { useFamilyProfileIndex, useGroupIndex, useVisitIndex } from "@/services/generated/apiEndpoints";
import { VisitStatus } from "@/services/generated/apiTypes";
import { toLocalDateString } from "@/lib/utils";
import { sumBy } from "lodash";

const Page = () => {
    const tabBarClearance = useTabBarClearance();

    const today = toLocalDateString();

    const visits = useVisitIndex({ date: today, status: VisitStatus.scheduled });
    const groups = useGroupIndex({ date: today });
    const families = useFamilyProfileIndex();
    
    const loading = visits.isPending || groups.isPending || families.isPending;
    const refreshing = visits.isFetching || groups.isFetching || families.isFetching;

    const todayVisits = visits.data?.data || [];
    const todayInterviews = groups.data?.data || [];
    const totalInterviewMembers = sumBy(todayInterviews, (i) => i.current_members_count ?? 0);

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-6"
            contentContainerStyle={{ paddingBottom: tabBarClearance }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                        visits.refetch();
                        groups.refetch();
                        families.refetch();
                    }}
                    tintColor="#61b346"
                    colors={["#61b346"]}
                />
            }
        >
            {loading ? (
                <View className="items-center justify-center py-24">
                    <ActivityIndicator size="large" color="#61b346" />
                </View>
            ) : (
                <>
                    <View className="gap-4">
                        <SectionHeader emoji="📅" title="Hoy" />

                        {todayVisits.length > 0 || todayInterviews.length > 0 ? (
                            <View className="gap-3">
                                {todayVisits.map((visit) => (
                                    <VisitCard
                                        key={visit.id}
                                        visit={visit}
                                        variant="summary"
                                    />
                                ))}
                                {todayInterviews.map((interview) => (
                                    <InterviewCard
                                        key={interview.id}
                                        interview={interview}
                                        variant="summary"
                                    />
                                ))}
                            </View>
                        ) : (
                            <EmptyState
                                emoji="🤔"
                                title="No hay actividades hoy"
                                subtitle="Vuelve a revisar más tarde."
                            />
                        )}
                    </View>

                    <View className="gap-4">
                        <SectionHeader emoji="📊" title="Resumen" />

                        <StatCard
                            size="full"
                            value={families.data?.meta.total ?? 0}
                            label="Familias Registradas"
                            iconName="bxs-group"
                            iconColor="#2563eb"
                            iconBgColor="bg-blue-100"
                        />

                        <View className="flex-row gap-4">
                            <StatCard
                                size="half"
                                value={totalInterviewMembers}
                                label="En entrevista"
                                iconName="bxs-file-detail"
                                iconColor="#f97316"
                                iconBgColor="bg-orange-100"
                            />
                            <StatCard
                                size="half"
                                value={visits.data?.meta.total ?? 0}
                                label="Visitas hoy"
                                iconName="bxs-location"
                                iconColor="#9333ea"
                                iconBgColor="bg-purple-100"
                            />
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

export default Page;
