import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { Family, FamilyCard } from "@/components/FamilyCard";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";
import StatCard from "@/components/StatCard";

const recentFamilies: Family[] = [
    {
        id: 1,
        name: "Familia 1",
        location: "Ubicacion",
        lastAttended: "Hace 123 tiempo",
        status: "Status",
    },
    {
        id: 2,
        name: "Familia 2",
        location: "Ubicacion",
        lastAttended: "Hace 123 tiempo",
        status: "Status",
    },
    {
        id: 3,
        name: "Familia 3",
        location: "Ubicacion",
        lastAttended: "Hace 123 tiempo",
        status: "Status",
    },
];

const Page = () => {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6 gap-6">
                <View className="flex-row items-center justify-between">
                    <Text variant="h3" className="font-bold text-gray-800">
                        Perfiles
                    </Text>

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

                <View className="flex-row flex-wrap justify-between gap-4">
                    <StatCard
                        size="half"
                        value={recentFamilies.length}
                        label="Familias"
                        iconName="bxs-group"
                        iconColor="#61b346"
                        iconBgColor="bg-primary/10"
                    />

                    <StatCard
                        size="half"
                        value="123"
                        label="Construidas"
                        iconName="bxs-check-circle"
                        iconColor="#10b981"
                        iconBgColor="bg-emerald-500/10"
                    />

                    <StatCard
                        size="full"
                        value="123"
                        label="Atendidas este Mes"
                        iconName="bxs-calendar-check"
                        iconColor="#3b82f6"
                        iconBgColor="bg-blue-500/10"
                        trend={{
                            value: "8",
                            label: "Este Mes",
                            color: "#3b82f6",
                            bgColor: "bg-blue-500/10",
                            iconName: "bx-trending-up",
                        }}
                    />
                </View>

                <View className="bg-white flex-row items-center px-4 py-3 rounded-2xl">
                    <Boxicon size={20} color="#9ca3af" name="bx-search" />
                    <TextInput
                        placeholder="Buscar Familia..."
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
