import React from "react";
import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Family, FamilyCard } from "@/components/FamilyCard";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";

const recentFamilies: Family[] = [
    {
        id: 1,
        name: "Familia 1",
        location: "Ubicación",
        lastAttended: "Hace 123 tiempo",
        status: "Activa",
    },
    {
        id: 2,
        name: "Familia 2",
        location: "Ubicación",
        lastAttended: "Hace 123 tiempo",
        status: "Activa",
    },
    {
        id: 3,
        name: "Familia 3",
        location: "Ubicación",
        lastAttended: "Hace 123 tiempo",
        status: "Activa",
    },
];

const Page = () => {
    const router = useRouter();

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
                    {recentFamilies.length === 0 ? (
                        <View className="bg-white p-6 rounded-2xl items-center gap-2">
                            <Boxicon
                                name="bxs-user-x"
                                size={32}
                                color="#9ca3af"
                            />
                            <Text className="text-gray-500 font-medium">
                                No hay familias registradas
                            </Text>
                        </View>
                    ) : (
                        recentFamilies.map((family) => (
                            <FamilyCard key={family.id} family={family} />
                        ))
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default Page;
