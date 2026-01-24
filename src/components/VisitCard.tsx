import React from "react";
import { View, TouchableOpacity, ToastAndroid, Linking, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { useRouter } from "expo-router";
import { formatDate } from "@/lib/utils";
import { Visit } from "@/types/api";

interface VisitCardProps {
    visit: Visit;
    variant?: "full" | "summary";
}

export const VisitCard = ({ visit, variant = "summary" }: VisitCardProps) => {
    const router = useRouter();

    const openMapsLink = async () => {
        const address = visit?.family_profile?.construction_address_link;

        if (!address) {
            ToastAndroid.show("Enlace de mapas no disponible.", ToastAndroid.SHORT);
            return;
        }

        try {
            await Linking.openURL(address);
        } catch (err) {
            ToastAndroid.show("No se pudo abrir la aplicación de mapas.", ToastAndroid.SHORT);
        }
    };

    const openPhone = async () => {
        const phone = visit?.family_profile?.responsible_member?.phone;

        if (!phone) {
            ToastAndroid.show("Número de teléfono del responsable no disponible.", ToastAndroid.SHORT);
            return;
        }

        const url = `tel:${phone}`;

        try {
            await Linking.openURL(url);
        } catch (err) {
            ToastAndroid.show('No se pudo abrir la aplicación de teléfono.', ToastAndroid.SHORT);
        }
    };

    if (variant === "full") {
        return (
            <TouchableOpacity
                className="bg-white rounded-2xl p-5 gap-3 shadow-sm"
                onPress={() => router.push(`/visit-detail/${visit.id}`)}
            >
                <View className="flex-row justify-between items-start gap-2">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-800">
                            {visit.family_profile?.family_name ?? "Sin nombre"}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Boxicon
                                name="bxs-location"
                                size={16}
                                color="#9ca3af"
                            />
                            <Text className="text-gray-500">
                                {visit.location_type}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-[#61b346]/10 px-3 py-1 rounded-full">
                        <Text className="text-primary font-bold">Hoy</Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-gray-50 border border-gray-200 px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center"
                        onPress={() => openPhone() }
                    >
                        <Text className="text-gray-500">
                            <Boxicon name="bxs-phone" size={16} />
                        </Text>
                        <Text className="text-gray-500 font-bold">Llamar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center"
                        onPress={() => openMapsLink()}
                    >
                        <Boxicon
                            name="bxs-location"
                            size={16}
                            color="#ffffff"
                        />
                        <Text className="text-white font-bold">Ver Ruta</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl flex-row items-center justify-between active:bg-gray-50 border border-gray-100"
            onPress={() => router.push(`/visit-detail/${visit.id}`)}
        >
            <View className="flex-row items-center gap-4 flex-1">
                <View className="bg-gray-100 h-12 w-12 rounded-full items-center justify-center">
                    <Boxicon name="bxs-home-heart" size={24} color="#6b7280" />
                </View>

                <View className="flex-1 gap-1">
                    <Text className="font-bold text-gray-800" numberOfLines={1}>
                        {visit.family_profile?.family_name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-gray-400 text-xs">
                            {formatDate(visit.scheduled_at)}
                        </Text>
                    </View>
                </View>
            </View>

            <Boxicon name="bx-chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>
    );
};
