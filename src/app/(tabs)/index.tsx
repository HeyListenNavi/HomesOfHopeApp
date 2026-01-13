import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import Boxicon from "@/components/Boxicons";
import { Family, FamilyCard } from "@/components/FamilyCard";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import QuickActionButton from "@/components/QuickActionButton";

const recentFamilies: Family[] = [
    {
        id: 1,
        name: "Familia 1",
        location: "Ubicación",
        lastAttended: "Hace 3 días",
        status: "Activa",
    },
    {
        id: 2,
        name: "Familia 2",
        location: "Ubicación",
        lastAttended: "Hace 1 semana",
        status: "Pendiente",
    },
    {
        id: 3,
        name: "Familia 3",
        location: "Ubicación",
        lastAttended: "Hace 2 semanas",
        status: "Activa",
    },
];

const Page = () => {
    const router = useRouter();

    return (
        <KeyboardAwareScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-8"
            showsVerticalScrollIndicator={false}
        >
            <View className="gap-4">
                <View className="gap-1">
                    <Text className="text-gray-500 text-sm">
                        Resumen general
                    </Text>
                    <Text variant="h3" className="font-bold text-gray-800">
                        Inicio
                    </Text>
                </View>

                <StatCard
                    size="full"
                    value={123}
                    label="Familias Registradas"
                    iconName="bxs-group"
                    iconColor="#2563eb"
                    iconBgColor="bg-blue-100"
                    trend={{
                        value: "+12",
                        label: "Este mes",
                        color: "#61b346",
                        bgColor: "bg-[#9BD189]/10",
                        iconName: "bxs-trending-up",
                    }}
                />

                <View className="flex-row gap-4">
                    <StatCard
                        size="half"
                        value={18}
                        label="En entrevista"
                        iconName="bxs-file-detail"
                        iconColor="#f97316"
                        iconBgColor="bg-orange-100"
                    />
                    <StatCard
                        size="half"
                        value={9}
                        label="En visitas"
                        iconName="bxs-location"
                        iconColor="#9333ea"
                        iconBgColor="bg-purple-100"
                    />
                </View>
            </View>

            <View className="gap-4">
                <Text variant="h3" className="font-bold text-gray-800">
                    Acciones rápidas
                </Text>

                <View className="bg-white rounded-2xl px-4 py-6">
                    <View className="flex-row flex-wrap gap-y-6">
                        <QuickActionButton
                            label="Crear Familia"
                            iconName="bxs-user-plus"
                            className="w-1/3 items-center"
                            onPress={() =>
                                router.push("/new-family-profile/123")
                            }
                        />
                        <QuickActionButton
                            label="Crear Staff"
                            iconName="bxs-user-id-card"
                            className="w-1/3 items-center"
                            onPress={() =>
                                router.push("/new-staff-profile/123")
                            }
                        />
                        <QuickActionButton
                            label="Panel"
                            iconName="bxs-dashboard"
                            className="w-1/3 items-center"
                        />
                        <QuickActionButton
                            label="Entrevista Hoy"
                            iconName="bxs-calendar-check"
                            className="w-1/3 items-center"
                            onPress={() => router.push("/interview-detail/123")}
                        />
                        <QuickActionButton
                            label="Visitas"
                            iconName="bxs-group"
                            className="w-1/3 items-center"
                            onPress={() => router.push("/(tabs)/visits")}
                        />
                        <QuickActionButton
                            label="Entrevistas"
                            iconName="bxs-message-circle-dots-2"
                            className="w-1/3 items-center"
                            onPress={() => router.push("/(tabs)/interviews")}
                        />
                    </View>
                </View>
            </View>

            <View className="gap-4">
                <View className="flex-row justify-between items-center">
                    <Text variant="h3" className="font-bold text-gray-800">
                        Familias recientes
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
                    {recentFamilies.map((family) => (
                        <FamilyCard key={family.id} family={family} />
                    ))}
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

export default Page;
