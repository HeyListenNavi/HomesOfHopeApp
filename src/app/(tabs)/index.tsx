import React from "react";
import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import Boxicon from "@/components/Boxicons";
import { Family, FamilyCard } from "@/components/FamilyCard";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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
        <KeyboardAwareScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-6"
            showsVerticalScrollIndicator={false}
        >
            <View className="gap-4">
                <Text
                    variant="h3"
                    className="text-start font-bold text-gray-800"
                >
                    Inicio
                </Text>

                <StatCard
                    size="full"
                    value={123}
                    label="Estadistica"
                    iconName="bxs-group"
                    iconColor="#2563eb"
                    iconBgColor="bg-blue-100"
                    trend={{
                        value: "+123",
                        label: "Este tiempo",
                        color: "#61b346",
                        bgColor: "bg-[#9BD189]/10",
                        iconName: "bxs-trending-up",
                    }}
                />

                <View className="flex-row justify-between">
                    <StatCard
                        size="half"
                        value={123}
                        label="En entrevista"
                        iconName="bxs-file-detail"
                        iconColor="#f97316"
                        iconBgColor="bg-orange-100"
                    />
                    <StatCard
                        size="half"
                        value={123}
                        label="En visitas"
                        iconName="bxs-location"
                        iconColor="#9333ea"
                        iconBgColor="bg-purple-100"
                    />
                </View>
            </View>

            <View className="gap-4">
                <Text
                    variant="h3"
                    className="text-start font-bold text-gray-800"
                >
                    Acciones Rapidas
                </Text>

                <View className="flex-row flex-wrap px-4 py-6 gap-4 justify-center bg-white rounded-2xl">
                    <View className="flex-1 min-w-[28%]">
                        <TouchableOpacity className="flex-col px-2 gap-1 items-center justify-center min-h-[96px]">
                            <Text className="text-white bg-primary/80 p-6 rounded-2xl">
                                <Boxicon name="bxs-user-plus" size={24} />
                            </Text>
                            <Text className="text-gray-400 font-medium text-xs text-center">
                                Crear Perfil
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 min-w-[28%]">
                        <TouchableOpacity className="flex-col px-2 gap-1 items-center justify-center min-h-[96px]">
                            <Text className="text-white bg-primary/80 p-6 rounded-2xl">
                                <Boxicon name="bxs-user-id-card" size={24} />
                            </Text>
                            <Text className="text-gray-400 font-medium text-xs text-center">
                                Crear Staff
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 min-w-[28%]">
                        <TouchableOpacity className="flex-col px-2 gap-1 items-center justify-center min-h-[96px]">
                            <Text className="text-white bg-primary/80 p-6 rounded-2xl">
                                <Boxicon name="bxs-dashboard" size={24} />
                            </Text>
                            <Text className="text-gray-400 font-medium text-xs text-center">
                                Abrir Panel
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 min-w-[28%]">
                        <TouchableOpacity className="flex-col px-2 gap-1 items-center justify-center min-h-[96px]">
                            <Text className="text-white bg-primary/80 p-6 rounded-2xl">
                                <Boxicon name="bxs-calendar-check" size={24} />
                            </Text>
                            <Text className="text-gray-400 font-medium text-xs text-center">
                                Entrevista de Hoy
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 min-w-[28%]">
                        <TouchableOpacity className="flex-col px-2 gap-1 items-center justify-center min-h-[96px]">
                            <Text className="text-white bg-primary/80 p-6 rounded-2xl">
                                <Boxicon name="bxs-group" size={24} />
                            </Text>
                            <Text className="text-gray-400 font-medium text-xs text-center">
                                Ver Visitas
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 min-w-[28%]">
                        <TouchableOpacity className="flex-col px-2 gap-1 items-center justify-center min-h-[96px]">
                            <Text className="text-white bg-primary/80 p-6 rounded-2xl">
                                <Boxicon
                                    name="bxs-message-circle-dots-2"
                                    size={24}
                                />
                            </Text>
                            <Text className="text-gray-400 font-medium text-xs text-center">
                                Ver Entrevistas
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="gap-4">
                <View className="flex-row justify-between items-center">
                    <Text
                        variant="h3"
                        className="text-start font-bold text-gray-800"
                    >
                        Familias recientes
                    </Text>
                    <Button
                        variant="link"
                        onPress={() => router.push("/(tabs)/families")}
                    >
                        <Text>Ver Todas</Text>
                    </Button>
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
                    {recentFamilies.map((family) => (
                        <FamilyCard key={family.id} family={family} />
                    ))}
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

export default Page;
