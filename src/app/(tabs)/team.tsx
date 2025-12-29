import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { Staff, StaffCard } from "@/components/StaffCard";
import StatCard from "@/components/StatCard";

const recentStaff: Staff[] = [
    {
        id: "1",
        name: "Staff 1",
        role: "Rol",
        phoneNumber: "123-456-7890",
        email: "correo@ywamsdb.org",
        photoUrl: "https://i.pravatar.cc/150?img=47",
    },
    {
        id: "2",
        name: "Staff 2",
        role: "Rol",
        phoneNumber: "123-456-7890",
        email: "correo@ywamsdb.org",
        photoUrl: "https://i.pravatar.cc/150?img=12",
    },
    {
        id: "3",
        name: "Staff 3",
        role: "Rol",
        phoneNumber: "123-456-7890",
        email: "correo@ywamsdb.org",
    },
];

const Page = () => {
    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerStyle={{ paddingBottom: 32 }}
        >
            <View className="p-6 gap-6">
                <View className="flex-row items-center justify-between">
                    <Text variant="h3" className="font-bold text-gray-800">
                        Equipo
                    </Text>

                    <TouchableOpacity className="flex-row gap-2 bg-primary py-2 px-4 rounded-xl">
                        <Text className="text-white">
                            <Boxicon name="bxs-plus" size={18} />
                        </Text>
                        <Text className="text-white text-center font-bold">
                            Añadir
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white flex-row items-center px-4 py-3 rounded-2xl">
                    <Boxicon size={20} color="#9ca3af" name="bx-search" />
                    <TextInput
                        placeholder="Buscar staff..."
                        placeholderTextColor="#9ca3af"
                        className="flex-1 ml-3 text-gray-700 text-base"
                    />
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
                            <Text className="text-gray-600 font-semibold">
                                No hay personal registrado
                            </Text>
                            <Text className="text-gray-400 text-center text-sm">
                                Agrega miembros del equipo para comenzar a
                                gestionar entrevistas y visitas.
                            </Text>
                        </View>
                    ) : (
                        recentStaff.map((staff) => (
                            <StaffCard key={staff.id} staff={staff} />
                        ))
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default Page;
