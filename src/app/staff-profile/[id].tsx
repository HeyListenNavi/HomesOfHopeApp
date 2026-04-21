import React from "react";
import { View, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import DetailSectionCard from "@/components/DetailSectionCard";
import InfoRow from "@/components/InfoRow";
import { useUser } from "@/hooks/useUsers";

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

const Page = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const userId = Number(id);

    const { data: user, isLoading, isError } = useUser(userId);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center gap-3">
                <ActivityIndicator size="large" color="#61b346" />
                <Text className="text-gray-400">Cargando perfil...</Text>
            </View>
        );
    }

    if (isError || !user) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center gap-3 p-8">
                <Boxicon name="bxs-x-circle" size={40} color="#ef4444" />
                <Text className="text-gray-700 font-semibold text-center">
                    No se pudo cargar el perfil del staff
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-primary font-medium">← Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const joinedAt = user.created_at
        ? new Date(user.created_at).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "N/A";

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-4 pb-20 gap-4"
            showsVerticalScrollIndicator={false}
        >
            <View className="bg-white p-6 rounded-2xl gap-5">
                <View className="flex-row items-center gap-4">
                    <Avatar className="w-20 h-20" alt={""}>
                        <AvatarFallback className="bg-transparent items-center justify-center">
                            <Boxicon
                                name="bxs-user-circle"
                                size={50}
                                color="#61b346"
                            />
                        </AvatarFallback>
                    </Avatar>

                    <View className="flex-1 gap-1">
                        <Text variant="h3" className="font-bold text-gray-800">
                            {user.name}
                        </Text>
                        <Text className="text-gray-500">{user.email}</Text>

                        <View className="flex-row gap-2 mt-1">
                            <Badge>
                                <Text className="text-white">Activo</Text>
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
                                onPress={() =>
                                    router.push(`/new-staff-profile/${user.id}`)
                                }
                                className="flex-row gap-2 p-3"
                            >
                                <Boxicon name="bxs-edit" size={18} />
                                <Text>Editar</Text>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </View>

                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL(`mailto:${user.email}`)
                        }
                        className="flex-1 bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2"
                    >
                        <Boxicon name="bxs-envelope" size={16} color="#ffffff" />
                        <Text className="text-white font-bold">Contactar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <DetailSectionCard title="Información General" icon="bxs-user">
                <InfoRow label="Correo" value={user.email} />
                <InfoRow label="Fecha de Ingreso" value={joinedAt} />
            </DetailSectionCard>
        </ScrollView>
    );
};

export default Page;
