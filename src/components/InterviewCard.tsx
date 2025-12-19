import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";

export interface Interview {
    id: string,
    title: string;
    date: string;
    time: string;
    familyCount: number;
    locationName: string;
    notes?: string;
}

interface InterviewCardProps {
    interview: Interview;
    variant?: "full" | "summary";
}

export const InterviewCard = ({ interview, variant = "summary" }: InterviewCardProps) => {
    const router = useRouter();
    const [timePart, periodPart] = interview.time.split(" ");

    if (variant === "full") {
        return (
            <TouchableOpacity
                className="bg-white rounded-2xl p-5 gap-3"
                onPress={() => router.push("/interview-detail/123")}
            >
                <View className="flex-row justify-between items-start gap-2">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-800">
                            {interview.title}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Boxicon name="bxs-location" size={16} color="#9ca3af" />
                            <Text className="text-gray-500">
                                {interview.locationName}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-[#61b346]/10 px-3 py-1 rounded-full">
                        <Text className="text-primary font-bold">{interview.time}</Text>
                    </View>
                </View>

                <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="bg-[#61b346]/10 p-2 rounded-full">
                            <Boxicon
                                name="bxs-group"
                                size={24}
                                color="#61b346"
                            />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-800">
                                {interview.familyCount}
                            </Text>
                            <Text className="text-gray-400">
                                Familias a entrevistar
                            </Text>
                        </View>
                    </View>

                    <Boxicon
                        name="bx-chevron-right"
                        size={24}
                        color="#d1d5db"
                    />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl flex-row items-center justify-between active:bg-gray-100"
            onPress={() => router.push("/interview-detail/123")}
        >
            <View className="flex-row items-center gap-4 flex-1">
                <View className="h-12 w-12 rounded-full items-center justify-center">
                    <Text className="font-bold">{timePart}</Text>
                    <Text className="text-xs text-gray-400">{periodPart}</Text>
                </View>

                <View className="flex-1 gap-1">
                    <Text className="font-bold">{interview.title}</Text>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-gray-400 text-sm">
                            {interview.date}
                        </Text>
                        <View className="flex-row items-center gap-0.5 bg-[#61b346]/10 px-2 py-0.5 rounded-md">
                            <Boxicon
                                name="bxs-group"
                                size={12}
                                color="#61b346"
                            />
                            <Text className="text-primary text-xs font-bold">
                                {interview.familyCount}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <Boxicon name="bx-chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>
    );
};
