import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import Boxicon from "~/components/Boxicons";
import { VisitCard } from "~/components/VisitCard";

interface VisitRoute {
    id: string,
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
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6 gap-6">
                <Text
                    variant="h3"
                    className="text-start font-bold text-gray-800"
                >
                    Visita de hoy
                </Text>

                <VisitCard key={todayVisit.id} visit={todayVisit} variant="full" />

                <View className="gap-4">
                    <Text
                        variant="h3"
                        className="text-start font-bold text-gray-800"
                    >
                        Visitas proximas
                    </Text>

                    <View className="gap-3">
                        {upcomingVisits.map((visit) => (
                            <VisitCard key={visit.id} visit={visit} variant="summary" />
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Page;
