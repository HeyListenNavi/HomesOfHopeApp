import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { StaffCard } from "@/components/StaffCard";
import StatCard from "@/components/StatCard";
import { Staff } from "../staff-profile/[id]";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";

const recentStaff: Staff[] = [
    {
        id: "1",
        name: "Staff 1",
        role: "Trabajador Social",
        phoneNumber: "123-456-7890",
        email: "correo@ywamsdb.org",
        photoUrl: "https://i.pravatar.cc/150?img=47",
    },
    {
        id: "2",
        name: "Staff 2",
        role: "Entrevistador",
        phoneNumber: "123-456-7890",
        email: "correo@ywamsdb.org",
        photoUrl: "https://i.pravatar.cc/150?img=12",
    },
    {
        id: "3",
        name: "Staff 3",
        role: "Voluntario",
        phoneNumber: "123-456-7890",
        email: "correo@ywamsdb.org",
    },
];

const Page = () => {
    const router = useRouter();

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-6 gap-6"
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-row items-start justify-between">
                <View className="gap-1">
                    <Text className="text-gray-500 text-sm">
                        Gestiona a los miembros del staff
                    </Text>
                    <Text variant="h3" className="font-bold text-gray-800">
                        Equipo
                    </Text>
                </View>

                <TouchableOpacity
                    className="flex-row gap-2 bg-primary/90 py-2 px-4 rounded-xl items-center"
                    onPress={() => router.push("/new-staff-profile/123")}
                >
                    <Boxicon name="bxs-plus" size={18} color="white" />
                    <Text className="text-white font-bold">Añadir</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row gap-4">
                <StatCard
                    size="half"
                    value={recentStaff.length}
                    label="Miembros"
                    iconName="bxs-group"
                    iconColor="#61b346"
                    iconBgColor="bg-primary/10"
                />

                <StatCard
                    size="half"
                    value={recentStaff.length}
                    label="Activos"
                    iconName="bxs-check-circle"
                    iconColor="#16a34a"
                    iconBgColor="bg-green-500/10"
                />
            </View>
            <View className="gap-4">
                <View className="flex-row justify-between items-center">
                    <Text variant="h3" className="font-bold text-gray-800">
                        Staff Reciente
                    </Text>
                    <Button
                        variant="link"
                        onPress={() => router.push("/(tabs)/families")}
                    >
                        <Text>Ver todos</Text>
                    </Button>
                </View>

                <View className="bg-white flex-row items-center px-4 py-2 rounded-2xl">
                    <Boxicon size={18} color="#9ca3af" name="bx-search" />
                    <TextInput
                        placeholder="Buscar por nombre..."
                        placeholderTextColor="#9ca3af"
                        className="flex-1 ml-3 text-gray-700 text-base"
                    />
                </View>
            </View>

            <View className="gap-3">
                {recentStaff.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl items-center gap-3">
                        <View className="bg-gray-100 p-4 rounded-full">
                            <Boxicon
                                name="bxs-user-x"
                                size={32}
                                color="#9ca3af"
                            />
                        </View>

                        <Text className="text-gray-700 font-semibold">
                            No hay personal registrado
                        </Text>

                        <Text className="text-gray-400 text-center text-sm leading-5">
                            Agrega miembros del equipo para comenzar a gestionar
                            entrevistas y visitas.
                        </Text>
                    </View>
                ) : (
                    recentStaff.map((staff) => (
                        <StaffCard key={staff.id} staff={staff} />
                    ))
                )}
            </View>
        </ScrollView>
    );
};

export default Page;
