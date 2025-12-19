import React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Interview, InterviewCard } from "@/components/InterviewCard";

const todayInterview: Interview = {
    id: "1",
    title: "Entrevista de Hoy",
    date: "01 de mes de 1234",
    time: "12:34 AM",
    familyCount: 123,
    locationName: "Lugar",
};

const upcomingInterviews: Interview[] = [
    {
        id: "2",
        title: "Entrevista 2",
        date: "01 de mes de 1234",
        time: "12:34 AM",
        familyCount: 123,
        locationName: "Lugar",
    },
    {
        id: "3",
        title: "Entrevista 3",
        date: "01 de mes de 1234",
        time: "12:34 AM",
        familyCount: 123,
        locationName: "Lugar",
    },
    {
        id: "4",
        title: "Entrevista 4",
        date: "01 de mes de 1234",
        time: "12:34 AM",
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
                    Entrevista de hoy
                </Text>

                <InterviewCard
                    key={todayInterview.id}
                    interview={todayInterview}
                    variant="full"
                />

                <View className="gap-4">
                    <Text
                        variant="h3"
                        className="text-start font-bold text-gray-800"
                    >
                        Entrevistas proximas
                    </Text>

                    <View className="gap-3">
                        {upcomingInterviews.map((visit) => (
                            <InterviewCard
                                key={visit.id}
                                interview={visit}
                                variant="summary"
                            />
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Page;
