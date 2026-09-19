import React from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";
import { useRouter } from "expo-router";
import { FamilyProfileResource } from "@/services/generated/apiTypes";
import { formatDate } from "@/lib/utils";
import FamilyStatusBadge, { getStatusLabel } from "@/components/FamilyStatusBadge";

interface FamilyCardProps {
    family: FamilyProfileResource;
}

const FamilyCard = ({ family }: FamilyCardProps) => {
    const router = useRouter();
    const phone = family.responsibleMember?.phone;
    const statusLabel = getStatusLabel(family.status);

    const openWhatsApp = (e: any) => {
        e.stopPropagation?.();
        if (!phone) return;
        const cleaned = phone.replace(/\D/g, "");
        Linking.openURL(`whatsapp://send?phone=${cleaned}`);
    };

    const accessibilityLabel = `${family.family_name}, ${family.home_address ?? "Sin dirección"}, ${statusLabel}`;

    return (
        <TouchableOpacity
            className="bg-white px-4 py-6 rounded-3xl flex-row items-center shadow-md shadow-black/5 active:bg-gray-100 gap-4"
            onPress={() => router.push(`/family-profile/${family.id}`)}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <View className="h-16 w-16 rounded-2xl bg-gray-100 items-center justify-center shrink-0">
                <Boxicon name="bxs-home-heart" size={28} color="#6b7280" />
            </View>

            <View className="flex-1 gap-1">
                <Text className="font-bold text-gray-800 text-xl leading-tight" numberOfLines={1}>
                    {family.family_name}
                </Text>

                <Text className="text-gray-500 text-base font-medium capitalize" numberOfLines={1}>
                    {family.home_address ?? "Sin dirección"}
                </Text>

                <View className="flex-row items-center gap-2 mt-1">
                    <FamilyStatusBadge status={family.status} />
                    <Text className="text-gray-500 text-sm font-medium">
                        {formatDate(family.updated_at)}
                    </Text>
                </View>
            </View>

            {phone ? (
                <TouchableOpacity
                    className="bg-[#f0fdf4] p-3 rounded-full"
                    onPress={openWhatsApp}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Enviar mensaje de WhatsApp"
                >
                    <BrandBoxicon name="bx-whatsapp" size={32} color="#16a34a" />
                </TouchableOpacity>
            ) : (
                <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
            )}
        </TouchableOpacity>
    );
};

export default FamilyCard;
