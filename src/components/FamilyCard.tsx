import React from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";
import { useRouter } from "expo-router";
import { FamilyProfile } from "@/types/api";
import { formatDate } from "@/lib/utils";

interface FamilyCardProps {
    family: FamilyProfile;
}

export const FamilyCard = ({ family }: FamilyCardProps) => {
    const router = useRouter();
    const phone = family.responsible_member?.phone;

    const openWhatsApp = (e: any) => {
        e.stopPropagation?.();
        if (!phone) return;
        const cleaned = phone.replace(/\D/g, "");
        Linking.openURL(`whatsapp://send?phone=${cleaned}`);
    };

    return (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl flex-row items-center active:bg-gray-50 gap-4"
            onPress={() => router.push(`/family-profile/${family.id}`)}
        >
            <View className="flex-1 gap-1">
                <Text
                    className="font-bold text-lg text-gray-800 leading-tight"
                    numberOfLines={1}
                >
                    {family.family_name}
                </Text>

                <Text className="text-gray-400 text-sm mb-1" numberOfLines={1}>
                    {family.current_address ?? ""}
                </Text>

                <View className="flex-row items-center gap-2">
                    <Badge variant={"default"}>
                        <Text className="font-medium">{family.status}</Text>
                    </Badge>

                    <View className="flex-row items-center gap-1">
                        <Boxicon size={10} color="#9ca3af" name="bxs-clock" />
                        <Text className="text-gray-400 text-sm">
                            {formatDate(family.updated_at)}
                        </Text>
                    </View>
                </View>
            </View>

            {phone ? (
                <TouchableOpacity
                    className="bg-[#9BD189]/10 p-3 rounded-full"
                    onPress={openWhatsApp}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <BrandBoxicon name="bx-whatsapp" size={28} color="#61b346" />
                </TouchableOpacity>
            ) : null}
        </TouchableOpacity>
    );
};
