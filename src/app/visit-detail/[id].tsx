import React from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VisitFamilyCard } from "@/components/FamilyVisitCard";
import { useLocalSearchParams, useRouter } from "expo-router";
// 1. Remove the service, import the hook
import { useVisit } from "@/hooks/useVisits";

export default function VisitDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // 2. Fetch data automatically
    const { data: visit, isLoading, isError } = useVisit(Number(id));

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    // 3. Handle Errors gracefully
    if (isError || !visit) {
        return (
            <View className="flex-1 justify-center items-center bg-white gap-4">
                <Boxicon name="bxs-x-circle" size={48} color="#ef4444" />
                <Text className="text-gray-500">No se pudo cargar la visita</Text>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                    <Text>Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 gap-6">
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-400">
                            Detalles de la visita
                        </Text>
                        <Text variant="h2" className="border-b-0 font-bold">
                            {visit.family_profile?.family_name || "Familia Desconocida"}
                        </Text>

                        {/* Attendant Section */}
                        <View className="flex-row items-center gap-3 mt-2">
                            <View className="flex-row">
                                <Avatar
                                    alt={visit.attendant?.name ?? "Sin asignar"}
                                    className="border-white -mr-2 border-2"
                                >
                                    <AvatarImage
                                        source={{
                                            uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                visit.attendant?.name ?? "Sin Nombre"
                                            )}&background=random`,
                                        }}
                                    />
                                    <AvatarFallback>
                                        <Text>
                                            {visit.attendant?.name?.substring(0, 2).toUpperCase() ?? "??"}
                                        </Text>
                                    </AvatarFallback>
                                </Avatar>
                            </View>
                            <Text className="text-gray-400 text-sm flex-1">
                                {visit.attendant 
                                    ? `Asignado a ${visit.attendant.name}` 
                                    : "Sin personal asignado"}
                            </Text>
                        </View>
                    </View>

                    {/* Notes Section */}
                    <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Boxicon
                                name="bxs-note"
                                size={16}
                                color="#eab308"
                            />
                            <Text className="font-bold italic text-yellow-600">
                                Notas generales
                            </Text>
                        </View>
                        {/* Check if notes is an array or string based on your type definition */}
                        <Text className="text-yellow-800/70">
                            {Array.isArray(visit.notes) && visit.notes.length > 0 
                                ? visit.notes.join(", ") 
                                : typeof visit.notes === 'string' && visit.notes 
                                    ? visit.notes 
                                    : "Sin notas registradas"
                            }
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center">
                        <Boxicon
                            name="bxs-location"
                            size={16}
                            color="#ffffff"
                        />
                        <Text className="text-white font-bold">Ver Ruta</Text>
                    </TouchableOpacity>
                </View>

                {/* Related Family Card */}
                <View className="gap-3">
                    <View>
                        <Text variant="h3" className="font-bold">
                            Familia
                        </Text>
                    </View>

                    <View className="gap-2">
                        {visit.family_profile ? (
                            <VisitFamilyCard
                                family={visit.family_profile}
                            />
                        ) : (
                            <Text className="text-gray-400 italic">
                                Perfil de familia no disponible
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}