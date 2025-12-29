import React from "react";
import { View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "expo-router";
import DetailSectionCard from "@/components/DetailSectionCard";
import InfoRow from "@/components/InfoRow";

export interface Staff {
    id: string;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
    photoUrl?: string | null;
    status?: string;
    phone?: string;
    joinedAt?: string;
    visitsThisMonth?: number;
    interviewsThisMonth?: number;
}

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

const Page = () => {
    const router = useRouter();
    const staff = mockStaff;

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-4 pb-20 gap-4"
            showsVerticalScrollIndicator={false}
        >
            <View className="bg-white p-6 rounded-2xl gap-5">
                <View className="flex-row items-center gap-4">
                    <Avatar className="w-20 h-20" alt={""}>
                        {staff.photoUrl ? (
                            <AvatarImage source={{ uri: staff.photoUrl }} />
                        ) : (
                            <AvatarFallback className="bg-tranparent items-center justify-center">
                                <Boxicon
                                    name="bxs-user-circle"
                                    size={50}
                                    color="#61b346"
                                />
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <View className="flex-1 gap-1">
                        <Text variant="h3" className="font-bold text-gray-800">
                            {staff.name}
                        </Text>
                        <Text className="text-gray-500">{staff.role}</Text>

                        <View className="flex-row gap-2 mt-1">
                            <Badge>
                                <Text className="text-white">
                                    {staff.status}
                                </Text>
                            </Badge>
                            <Badge variant="secondary">
                                <Text className="text-gray-600">
                                    {staff.phoneNumber}
                                </Text>
                            </Badge>
                        </View>
                    </View>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <TouchableOpacity className="p-1">
                                <Boxicon
                                    name="bxs-dots-vertical-rounded"
                                    size={24}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-white rounded-2xl border-transparent shadow-lg shadow-black/40"
                        >
                            <DropdownMenuItem
                                onPress={() => router.push("/new-staff-profile/123")}
                                className="flex-row gap-2 p-3"
                            >
                                <Boxicon name="bxs-edit" size={18} />
                                <Text>Editar</Text>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex-row gap-2 p-3">
                                <Boxicon
                                    name="bxs-user-x"
                                    size={18}
                                    color="#ef4444"
                                />
                                <Text className="text-red-500">Desactivar</Text>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </View>

                {/* Contact buttons */}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL(
                                `whatsapp://send?phone=${staff.phoneNumber}`
                            )
                        }
                        className="flex-1 bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2"
                    >
                        <Boxicon name="bxs-phone" size={16} color="#ffffff" />
                        <Text className="text-white font-bold">Contactar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => Linking.openURL(`mailto:${staff.email}`)}
                        className="bg-gray-100 px-4 py-4 rounded-2xl"
                    >
                        <Boxicon
                            name="bxs-envelope"
                            size={18}
                            color="#6b7280"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ---------- GENERAL INFO ---------- */}
            <DetailSectionCard title="Información General" icon="bxs-user">
                <InfoRow label="Correo" value={staff.email} />
                <InfoRow label="Teléfono" value={staff.phoneNumber} />
                <InfoRow label="Fecha de Ingreso" value={staff.joinedAt} />
            </DetailSectionCard>

            {/* ---------- STATS ---------- */}
            <DetailSectionCard title="Actividad" icon="bxs-bar-chart-big">
                <View className="flex-row gap-4">
                    <View className="flex-1 bg-gray-100 p-4 rounded-xl gap-1">
                        <Text className="text-gray-400 text-xs uppercase">
                            Visita (Mes)
                        </Text>
                        <Text className="text-2xl font-bold text-gray-800">
                            {staff.visitsThisMonth}
                        </Text>
                    </View>

                    <View className="flex-1 bg-gray-100 p-4 rounded-xl gap-1">
                        <Text className="text-gray-400 text-xs uppercase">
                            Entrevistas (Mes)
                        </Text>
                        <Text className="text-2xl font-bold text-gray-800">
                            {staff.interviewsThisMonth}
                        </Text>
                    </View>
                </View>
            </DetailSectionCard>
        </ScrollView>
    );
};

export default Page;
