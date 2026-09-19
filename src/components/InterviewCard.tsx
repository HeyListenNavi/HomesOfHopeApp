import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";
import type { GroupResource } from "@/services/generated/apiTypes";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface InterviewCardProps {
    interview: GroupResource;
    variant?: "full" | "summary";
}

const InterviewCard = ({ interview, variant = "summary" }: InterviewCardProps) => {
    const router = useRouter();

    const dateObj = interview.date_time ? new Date(interview.date_time) : null;
    const timeString = dateObj
        ? dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
        : "Sin hora";
    const dateString = dateObj ? formatDate(interview.date_time) : "Sin fecha";

    if (variant === "full") {
        const accessibilityLabel = `${interview.name}, ${interview.location || "Sin ubicación"}, ${dateString} ${timeString}, ${interview.current_members_count} de ${interview.capacity} familias`;

        return (
            <TouchableOpacity
                className="bg-white rounded-3xl p-6 gap-4 shadow-md shadow-black/5"
                onPress={() => router.push(`/interview-detail/${interview.id}`)}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
            >
                <View className="gap-1">
                    <View className="flex-row justify-between items-center gap-2">
                        <Text className="text-2xl font-bold text-gray-800">
                            {interview.name}
                        </Text>
                        <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                            <Text className="text-primary font-bold text-sm">Hoy</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <Boxicon name="bxs-location" size={20} color="#9ca3af" />
                        <Text className="text-sm text-gray-500 flex-1">
                            {interview.location || "Sin ubicación"}
                        </Text>
                    </View>
                </View>

                <View className="py-2 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center shrink-0">
                            <Boxicon name="bxs-group" size={28} color="#61b346" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-800 text-lg">
                                {interview.current_members_count} / {interview.capacity}
                            </Text>
                            <Text className="text-gray-500 font-medium">
                                Familias asignadas
                            </Text>
                        </View>
                    </View>

                    <Boxicon
                        name="bx-chevron-right"
                        size={28}
                        color="#d1d5db"
                    />
                </View>
            </TouchableOpacity>
        );
    }

    const accessibilityLabel = `${interview.name}, ${interview.location || "Sin ubicación"}, ${dateString} ${timeString}, ${interview.current_members_count} de ${interview.capacity} familias`;

    return (
        <TouchableOpacity
            className="bg-white px-4 py-6 rounded-3xl flex-row items-center shadow-md shadow-black/5 active:bg-gray-100 gap-4"
            onPress={() => router.push(`/interview-detail/${interview.id}`)}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <View className="h-16 w-16 rounded-2xl bg-gray-100 items-center justify-center shrink-0">
                <Boxicon name="bxs-clipboard-detail" size={28} color="#6b7280" />
            </View>

            <View className="flex-1 gap-1">
                <Text className="font-bold text-gray-800 text-xl leading-tight" numberOfLines={1}>
                    {interview.name}
                </Text>

                <Text className="text-gray-500 text-sm font-medium capitalize" numberOfLines={1}>
                    {interview.location || "Sin ubicación"}
                </Text>

                <View className="flex-row items-center gap-2 mt-1">
                    <Badge className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full">
                        <Text className="text-primary text-sm font-bold">
                            {dateString} • {timeString}
                        </Text>
                    </Badge>
                    <Badge className="bg-blue-100 border-transparent px-3 py-1.5 rounded-full">
                        <Text className="text-blue-700 text-sm font-bold">
                            {interview.current_members_count}/{interview.capacity}
                        </Text>
                    </Badge>
                </View>
            </View>

            <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
        </TouchableOpacity>
    );
};

export default InterviewCard;
