import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";

export interface Applicant {
    id: string;
    name: string;
    curp: string;
    phone: string;
    location?: string;
    status: string;
    aiContext?: {
        income: string;
        housing: string;
        notes: string;
    };
}

export interface ApplicantProps {
    applicant: Applicant;
}

export default function ApplicantInterviewCard({ applicant }: ApplicantProps) {
    const router = useRouter();

    return (
        <View className="p-4 rounded-2xl gap-4 bg-white mb-4 border border-gray-100">
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="font-bold text-lg text-primary">
                        {applicant.name}
                    </Text>
                    <Text className="text-sm text-gray-400">
                        {applicant.curp}
                    </Text>
                </View>
                <Badge variant={"default"}>
                    <Text className="font-medium">{applicant.status}</Text>
                </Badge>
            </View>

            <View className="flex-row gap-6">
                {applicant.location && (
                    <View className="flex-row items-center gap-1">
                        <Boxicon
                            name="bxs-location"
                            size={18}
                            color="#9ca3af"
                        />
                        <Text className="text-gray-400">
                            {applicant.location}
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-row gap-6">
                {applicant.phone && (
                    <View className="flex-row items-center gap-1">
                        <Boxicon name="bxs-phone" size={18} color="#9ca3af" />
                        <Text className="text-gray-400">{applicant.phone}</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                className="bg-primary w-full py-4 rounded-2xl flex-row justify-center items-center"
                onPress={() => router.push("/new-family-profile/123")}
            >
                <Text className="text-white font-bold">Crear Perfil</Text>
                <Boxicon name="bxs-chevron-right" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
}
