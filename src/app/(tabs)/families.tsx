import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { FamilyCard } from "@/components/FamilyCard";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { familyService } from "@/services/familyService";
import { FamilyProfile } from "@/types/api";

const Page = () => {
    const router = useRouter();

    const [recentFamilies, setRecentFamilies] = useState<FamilyProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await familyService.getAll();
            setRecentFamilies(response.data);
        } catch (error) {
            console.error("Error al cargar familias:", error);
            Alert.alert(
                "Error",
                "No se pudieron cargar las familias recientes."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-8"
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-row items-center justify-between">
                <View className="gap-1">
                    <Text className="text-gray-500 text-sm">
                        Gestión de perfiles familiares
                    </Text>

                    <Text variant="h3" className="font-bold text-gray-800">
                        Familias
                    </Text>
                </View>

                <TouchableOpacity
                    className="flex-row gap-2 bg-primary py-2 px-4 rounded-xl"
                    onPress={() => router.push("/new-family-profile/123")}
                >
                    <Text className="text-white">
                        <Boxicon name="bxs-plus" size={18} />
                    </Text>
                    <Text className="text-white text-center font-bold">
                        Añadir
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="gap-4">
                <View className="flex-row justify-between">
                    <StatCard
                        size="half"
                        value={recentFamilies.length}
                        label="Familias"
                        iconName="bxs-group"
                        iconColor="#61b346"
                        iconBgColor="bg-[#61b346]/10"
                    />

                    <StatCard
                        size="half"
                        value={123}
                        label="Construidas"
                        iconName="bxs-check-circle"
                        iconColor="#16a34a"
                        iconBgColor="bg-green-500/10"
                    />
                </View>

                <StatCard
                    size="full"
                    value={123}
                    label="Atendidas este mes"
                    iconName="bxs-calendar-check"
                    iconColor="#2563eb"
                    iconBgColor="bg-blue-500/10"
                    trend={{
                        value: "+8",
                        label: "Este mes",
                        color: "#2563eb",
                        bgColor: "bg-blue-500/10",
                        iconName: "bxs-trending-up",
                    }}
                />
            </View>

            <View className="gap-4">
                <View className="flex-row justify-between items-center">
                    <Text variant="h3" className="font-bold text-gray-800">
                        Familias Recientes
                    </Text>
                    <Button
                        variant="link"
                        onPress={() => router.push("/(tabs)/families")}
                    >
                        <Text>Ver todas</Text>
                    </Button>
                </View>

                <View className="bg-white flex-row items-center px-4 py-2 rounded-2xl">
                    <Boxicon size={18} color="#9ca3af" name="bx-search" />
                    <TextInput
                        placeholder="Buscar familia..."
                        placeholderTextColor="#9ca3af"
                        className="flex-1 ml-3 text-gray-700 text-base"
                    />
                </View>

                <View className="gap-3">
                    {isLoading ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator size="large" color="#61b346" />
                            <Text className="text-gray-400 mt-2">
                                Cargando...
                            </Text>
                        </View>
                    ) : recentFamilies.length > 0 ? (
                        recentFamilies.map((family) => (
                            <FamilyCard key={family.id} family={family} />
                        ))
                    ) : (
                        <Text className="text-center text-gray-400 py-4">
                            No hay familias registradas aún.
                        </Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default Page;
