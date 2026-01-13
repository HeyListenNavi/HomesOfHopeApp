import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { VisitCard } from "@/components/VisitCard";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";

interface VisitRoute {
    id: string;
    title: string;
    date: string;
    familyCount: number;
    locationName: string;
}

const todayVisit: VisitRoute = {
    id: "1",
    title: "Visita de Hoy",
    date: "01 de mes de 1234",
    familyCount: 123,
    locationName: "Lugar",
};

const upcomingVisits: VisitRoute[] = [
    {
        id: "2",
        title: "Visita 1",
        date: "01 de mes de 1234",
        familyCount: 123,
        locationName: "Lugar",
    },
    {
        id: "3",
        title: "Visita 2",
        date: "01 de mes de 1234",
        familyCount: 123,
        locationName: "Lugar",
    },
    {
        id: "4",
        title: "Visita 3",
        date: "01 de mes de 1234",
        familyCount: 123,
        locationName: "Lugar",
    },
];

const Page = () => {
    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-8"
            showsVerticalScrollIndicator={false}
        >
            <View className="gap-1">
                <Text className="text-gray-500 text-sm">
                    Gestión y seguimiento de recorridos
                </Text>
                <Text variant="h3" className="font-bold text-gray-800">
                    Visitas
                </Text>
            </View>

            <VisitCard visit={todayVisit} variant="full" />

            <View className="gap-4">
                <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500">
                        Próximas Visitas
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-primary text-sm font-medium">
                            Ver todas
                        </Text>
                    </TouchableOpacity>
                </View>

                {upcomingVisits.length === 0 ? (
                    <View className="bg-white p-6 rounded-2xl items-center gap-2">
                        <Boxicon
                            name="bxs-calendar-x"
                            size={32}
                            color="#9ca3af"
                        />
                        <Text className="text-gray-500">
                            No hay visitas programadas
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {upcomingVisits.map((visit) => (
                            <VisitCard
                                key={visit.id}
                                visit={visit}
                                variant="summary"
                            />
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default Page;
