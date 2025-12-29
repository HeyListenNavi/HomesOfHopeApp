import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Boxicon from "@/components/Boxicons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Staff } from "./staff-profile/[id]";
import DetailSectionCard from "@/components/DetailSectionCard";
import InfoRow from "@/components/InfoRow";

const mockStaff: Staff = {
    name: "Nombre",
    role: "Rol",
    status: "Estatus",
    phoneNumber: "123 456 7890",
    email: "correo@ywamsdb.org",
    photoUrl: "https://i.pravatar.cc/150?img=47",
    joinedAt: "12/34/5678",
    visitsThisMonth: 24,
    interviewsThisMonth: 6,
    id: "1",
};

const ROLE_LABELS: Record<string, string> = {
    social_worker: "Trabajador Social",
    interviewer: "Entrevistador",
    admin: "Administrador",
    volunteer: "Voluntario",
};

const Page = () => {
    const router = useRouter();
    const staff = mockStaff;

    return (
        <View className="flex-1 bg-gray-100 p-4 gap-4">
            <View className="bg-white px-6 py-10 rounded-2xl">
                <View className="items-center gap-3">
                    <Avatar className="h-28 w-28" alt={""}>
                        {staff.photoUrl ? (
                            <AvatarImage source={{ uri: staff.photoUrl }} />
                        ) : (
                            <AvatarFallback>
                                <Boxicon
                                    name="bxs-user"
                                    size={48}
                                    color="#9ca3af"
                                />
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <View className="items-center gap-1">
                        <Text
                            variant="h2"
                            className="font-bold border-b-transparent text-primary"
                        >
                            {staff.name}
                        </Text>

                        <Text className="text-gray-500 font-medium">
                            {ROLE_LABELS[staff.role] ?? staff.role}
                        </Text>
                    </View>
                </View>
            </View>

            <DetailSectionCard title="Información" icon="bxs-user-id-card">
                <InfoRow label="Correo" value={staff.email} />
                <InfoRow label="Teléfono" value={staff.phoneNumber} />
                <InfoRow label="Fecha de Ingreso" value={staff.joinedAt} />
            </DetailSectionCard>

            <DetailSectionCard title="Cuenta" icon="bxs-user-circle">
                <TouchableOpacity className="flex-row items-center gap-4 p-4">
                    <Boxicon name="bxs-lock" size={20} color="#6b7280" />
                    <Text className="font-medium text-gray-800">
                        Cambiar contraseña
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row rounded-2xl items-center gap-4 p-4"
                    onPress={() => {
                        router.replace("/login");
                    }}
                >
                    <Boxicon
                        name="bxs-arrow-out-right-square-half"
                        size={20}
                        color="#ef4444"
                    />
                    <Text className="font-medium text-red-500">
                        Cerrar sesión
                    </Text>
                </TouchableOpacity>
            </DetailSectionCard>
        </View>
    );
};

export default Page;
