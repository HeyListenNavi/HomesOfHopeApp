import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";

export interface VisitRoute {
    id: string,
    title: string;
    date: string;
    familyCount: number;
    locationName: string;
}

interface VisitCardProps {
    visit: VisitRoute;
    variant?: "full" | "summary";
}

export const VisitCard = ({ visit, variant = "summary" }: VisitCardProps) => {
    const router = useRouter();

    if (variant === "full") {
        return (
            <TouchableOpacity
                className="bg-white rounded-2xl p-5 gap-3"
                onPress={() => router.push("/visit-detail/123")}
            >
                <View className="flex-row justify-between items-start gap-2">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-800">
                            {visit.title}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Boxicon name="bxs-location" size={16} color="#9ca3af" />
                            <Text className="text-gray-500">
                                {visit.locationName}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-[#61b346]/10 px-3 py-1 rounded-full">
                        <Text className="text-primary font-bold">Hoy</Text>
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
                                {visit.familyCount}
                            </Text>
                            <Text className="text-gray-400">
                                Familias a visitar
                            </Text>
                        </View>
                    </View>

                    <Boxicon
                        name="bx-chevron-right"
                        size={24}
                        color="#d1d5db"
                    />
                </View>

                <TouchableOpacity className="bg-primary w-full py-4 rounded-2xl flex-row justify-center items-center">
                    <Text className="text-white font-bold">Iniciar Visita</Text>
                    <Boxicon name="bxs-play" size={20} color="white" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl flex-row items-center justify-between active:bg-gray-100"
            onPress={() => router.push("/visit-detail/123")}
        >
            <View className="flex-row items-center gap-4 flex-1">
                <View className="bg-gray-100 h-12 w-12 rounded-full items-center justify-center">
                    <Boxicon
                        name="bxs-calendar-detail"
                        size={24}
                        color="#6b7280"
                    />
                </View>

                <View className="flex-1 gap-1">
                    <Text className="font-bold">{visit.title}</Text>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-gray-400 text-sm">
                            {visit.date}
                        </Text>
                        <View className="flex-row items-center gap-0.5 bg-[#61b346]/10 px-2 py-0.5 rounded-md">
                            <Boxicon
                                name="bxs-group"
                                size={12}
                                color="#61b346"
                            />
                            <Text className="text-primary text-xs font-bold">
                                {visit.familyCount}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <Boxicon name="bx-chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>
    );
};
