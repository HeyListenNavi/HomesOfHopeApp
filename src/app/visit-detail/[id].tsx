import React, { useEffect, useState } from "react";
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
import { visitService } from "@/services/visitService";
import { Visit } from "@/types/api";

export default function VisitDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [visit, setVisit] = useState<Visit>();

    useEffect(() => {
        if (!id) return;
        loadVisitDetails();
    }, [id]);

    const loadVisitDetails = async () => {
        try {
            setLoading(true);
            const data = await visitService.getById(Number(id));
            setVisit(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo cargar la visita");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    if (!visit) return null;

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 gap-6">
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-400">
                            Detalles de la visita
                        </Text>
                        <Text variant="h2" className="border-b-0 font-bold">
                            {visit.family_profile?.family_name}
                        </Text>

                        <View className="flex-row items-center gap-3 mt-2">
                            <View className="flex-row">
                                <Avatar
                                    alt={visit.attendant?.name ?? "Sin asignar"}
                                    className="border-white -mr-2 border-2"
                                >
                                    <AvatarImage
                                        source={{
                                            uri:`https://ui-avatars.com/api/?name=${encodeURIComponent(visit.attendant?.name ?? "Sin Nombre")}&background=random`,
                                        }}
                                    />
                                </Avatar>
                            </View>
                            <Text className="text-gray-400 text-sm flex-1">
                                {`Asignado a ${visit.attendant?.name}`}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Boxicon
                                name="bxs-note"
                                size={16}
                                color="#eab308"
                            />
                            <Text className="font-bold text-yellow-600">
                                Notas
                            </Text>
                        </View>
                        <Text className="text-yellow-800/70">
                            {visit.notes?.length > 0 ? visit.notes : "Sin notas"}
                        </Text>
                    </View>

                    <TouchableOpacity className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center">
                        <Boxicon
                            name="bxs-location"
                            size={16}
                            color="#ffffff"
                        />
                        <Text className="text-white font-bold">Ver Ruta</Text>
                    </TouchableOpacity>
                </View>

                <View className="gap-3">
                    <View>
                        <Text variant="h3" className="font-bold">
                            Familia
                        </Text>
                    </View>

                    <View className="gap-2">
                        <VisitFamilyCard
                            family={visit.family_profile}
                        />
                    </View>

                    <View className="items-center">
                        <Text className="text-gray-400 text-xs">
                            Fin de la lista de familias
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
