import React from "react";
import { View, TouchableOpacity, ToastAndroid, Linking, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { useRouter } from "expo-router";
import { formatDate } from "@/lib/utils";
import { getVisitMapsLink } from "@/lib/maps";
import { VisitResource, VisitStatus } from "@/services/generated/apiTypes";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";

interface VisitCardProps {
    visit: VisitResource;
    variant?: "full" | "summary";
    familyName?: string;
    readOnly?: boolean;
}

const VisitCard = ({ visit, variant = "summary", familyName, readOnly = false }: VisitCardProps) => {
    const router = useRouter();

    const openMapsLink = async () => {
        const address = getVisitMapsLink(visit?.location_type, visit?.family_profile);

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
        console.log(visit)

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

    const locationLabel = visit.location_type === "home" ? "Vivienda Actual" : visit.location_type === "land" ? "Terreno" : visit.location_type || "Visita";

    const finalFamilyName = familyName || visit.family_profile?.family_name || "Visita Programada";

    const { can } = usePermissions();
    const canFinalize = visit.status === VisitStatus.scheduled && can(Permission.visitUpdate);

    if (variant === "full") {
        const accessibilityLabel = `${finalFamilyName}, ${locationLabel}, Hoy`;

        return (
            <TouchableOpacity
                className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4"
                onPress={() => router.push(readOnly || !canFinalize ? `/visit-detail/${visit.id}` : `/visit-close/${visit.id}`)}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
            >
                <View className="flex-row justify-between items-start gap-2">
                    <View className="flex-1 gap-1">
                        <Text className="text-2xl font-bold text-gray-800">
                            {finalFamilyName}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Boxicon
                                name="bxs-location"
                                size={20}
                                color="#9ca3af"
                            />
                            <Text className="text-gray-500 text-lg">
                                {locationLabel}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                        <Text className="text-primary font-bold text-sm">Hoy</Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-gray-100 px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center"
                        onPress={() => openPhone()}
                        accessibilityRole="button"
                        accessibilityLabel="Llamar al responsable de la familia"
                    >
                        <Text className="text-gray-500">
                            <Boxicon name="bxs-phone" size={20} />
                        </Text>
                        <Text className="text-gray-500 font-bold">Llamar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center shadow-lg shadow-primary/30"
                        onPress={() => openMapsLink()}
                        accessibilityRole="button"
                        accessibilityLabel="Ver ruta en mapas"
                    >
                        <Boxicon
                            name="bxs-location"
                            size={20}
                            color="#ffffff"
                        />
                        <Text className="text-white font-bold">Ver Ruta</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }

    const accessibilityLabel = `${finalFamilyName}, ${locationLabel}, ${formatDate(visit.scheduled_at)}`;

    return (
        <TouchableOpacity
            className="bg-white border border-gray-100 px-4 py-6 rounded-3xl flex-row items-center shadow-sm shadow-black/5 active:bg-gray-50 gap-4"
            onPress={() => router.push(readOnly || !canFinalize ? `/visit-detail/${visit.id}` : `/visit-close/${visit.id}`)}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <View className="h-16 w-16 rounded-2xl bg-gray-100 items-center justify-center shrink-0">
                <Boxicon name="bxs-location" size={28} color="#6b7280" />
            </View>

            <View className="flex-1 gap-1">
                <Text className="font-bold text-gray-800 text-xl leading-tight" numberOfLines={1}>
                    {finalFamilyName}
                </Text>

                <Text className="text-gray-500 text-base font-medium capitalize" numberOfLines={1}>
                    {locationLabel}
                </Text>

                <View className="flex-row items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 border-transparent px-3 py-1.5 rounded-full">
                        <Text className="text-blue-700 text-sm font-bold">
                            {formatDate(visit.scheduled_at)}
                        </Text>
                    </Badge>
                </View>
            </View>

            <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
        </TouchableOpacity>
    );
};

export default VisitCard;
