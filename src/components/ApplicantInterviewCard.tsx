import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";

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
    return (
        <TouchableOpacity className="p-4 rounded-2xl gap-4 bg-white mb-4 border border-gray-100">
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

            <View className="flex-row justify-between items-center">
                <View>
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
                                <Boxicon
                                    name="bxs-phone"
                                    size={18}
                                    color="#9ca3af"
                                />
                                <Text className="text-gray-400">
                                    {applicant.phone}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <Boxicon name="bx-chevron-right" size={24} color="#d1d5db" />
            </View>
        </TouchableOpacity>
    );
}
