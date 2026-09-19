import React from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";
import { useRouter } from "expo-router";
import { UserResource } from "@/services/generated/apiTypes";

interface StaffCardProps {
    user: UserResource;
}

const StaffCard = ({ user }: StaffCardProps) => {
    const router = useRouter();
    
    const roleLabels = (user.roles ?? []).map(String);

    const rolesString = roleLabels.join(", ");
    const accessibilityLabel = `${user.name}, ${rolesString}, ${user.email}`;

    return (
        <TouchableOpacity
            className="bg-white px-4 py-6 rounded-3xl flex-row items-center shadow-md shadow-black/5 active:bg-gray-100 gap-4"
            onPress={() => router.push(`/staff-profile/${user.id}`)}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <View
                className="h-16 w-16 rounded-2xl bg-gray-100 items-center justify-center shrink-0"
            >
                <Boxicon
                    name="bxs-user"
                    size={28}
                    color="#6b7280"
                />
            </View>

            <View className="flex-1 gap-1">
                <Text
                    className="font-bold text-gray-800 text-xl leading-tight"
                    numberOfLines={1}
                >
                    {user.name}
                </Text>

                <Text
                    className="text-gray-500 text-base font-medium"
                    numberOfLines={1}
                >
                    {user.email}
                </Text>

                <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
                    {roleLabels.map((label, idx) => (
                        <Badge
                            key={`${label}-${idx}`}
                            className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full flex-row items-center gap-1"
                        >
                            <Text className="text-primary text-sm font-bold">
                                {label}
                            </Text>
                        </Badge>
                    ))}
                </View>
            </View>

            <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
        </TouchableOpacity>
    );
};

export default StaffCard;


