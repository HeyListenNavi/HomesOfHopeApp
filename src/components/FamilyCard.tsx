import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";

export interface Family {
    id: number;
    name: string;
    location: string;
    image: string;
    lastAttended: string;
    status: string;
}

interface FamilyCardProps {
    family: Family;
}

export const FamilyCard = ({ family }: FamilyCardProps) => {
    return (
        <TouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center active:bg-gray-50 gap-4">
            <Image
                source={{ uri: family.image }}
                className="w-14 h-14 rounded-full bg-gray-200"
            />

            <View className="flex-1 gap-1">
                <Text
                    className="font-bold text-lg text-gray-800 leading-tight"
                    numberOfLines={1}
                >
                    {family.name}
                </Text>

                <Text className="text-gray-400 text-sm mb-1" numberOfLines={1}>
                    {family.location}
                </Text>

                <View className="flex-row items-center gap-2">
                    <Badge variant={"default"}>
                        <Text className="font-medium">{family.status}</Text>
                    </Badge>

                    <View className="flex-row items-center gap-1">
                        <Boxicon size={10} color="#9ca3af" name="bxs-clock" />
                        <Text className="text-gray-400 text-sm">
                            {family.lastAttended}
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity className="bg-[#9BD189]/10 p-3 rounded-full">
                <BrandBoxicon name="bx-whatsapp" size={28} color="#61b346" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};
