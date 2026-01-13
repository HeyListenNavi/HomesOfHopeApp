import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Interview, InterviewCard } from "@/components/InterviewCard";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";

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
    const router = useRouter();

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-8"
            showsVerticalScrollIndicator={false}
        >
            <View className="gap-1">
                <Text className="text-gray-500 text-sm">
                    Seguimiento y programación
                </Text>
                <Text variant="h3" className="font-bold text-gray-800">
                    Entrevistas
                </Text>
            </View>

            <InterviewCard interview={todayInterview} variant="full" />

            <View className="gap-4">
                <View className="flex-row justify-between items-center">
                    <Text className="font-semibold text-gray-500">
                        Próximas Entrevistas
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-primary text-sm font-medium">
                            Ver todas
                        </Text>
                    </TouchableOpacity>
                </View>

                {upcomingInterviews.length === 0 ? (
                    <View className="bg-white p-6 rounded-2xl items-center gap-2">
                        <Boxicon
                            name="bxs-message-x"
                            size={32}
                            color="#9ca3af"
                        />
                        <Text className="text-gray-500">
                            No hay entrevistas programadas
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {upcomingInterviews.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                interview={interview}
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
