import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";
import { useRouter } from "expo-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface Staff {
    id: string;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
    photoUrl?: string | null;
}

interface StaffCardProps {
    staff: Staff;
}

export const StaffCard = ({ staff }: StaffCardProps) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl flex-row items-center gap-4 active:bg-gray-50"
            onPress={() => router.push(`/staff-profile/${staff.id}`)}
        >
            <Avatar className="w-14 h-14" alt={""}>
                {staff.photoUrl ? (
                    <AvatarImage source={{ uri: staff.photoUrl }} />
                ) : (
                    <AvatarFallback className="bg-tranparent items-center justify-center">
                        <Boxicon
                            name="bxs-user-circle"
                            size={50}
                            color="#61b346"
                        />
                    </AvatarFallback>
                )}
            </Avatar>

            <View className="flex-1">
                <Text
                    className="font-bold text-lg text-gray-800"
                    numberOfLines={1}
                >
                    {staff.name}
                </Text>

                <Text className="text-gray-400 text-sm" numberOfLines={1}>
                    {staff.email}
                </Text>

                <View className="flex-row mt-2">
                    <Badge>
                        <Text className="font-medium">{staff.role}</Text>
                    </Badge>
                </View>
            </View>

            <TouchableOpacity className="bg-[#9BD189]/10 p-3 rounded-full">
                <BrandBoxicon name="bx-whatsapp" size={26} color="#61b346" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};
