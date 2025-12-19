import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FamilyVisit, VisitFamilyCard } from "@/components/FamilyVisitCard";

export interface Assignee {
    id: string;
    name: string;
    avatarUrl: string;
    initials: string;
}

export interface VisitDetailData {
    id: string;
    routeTitle: string;
    assignees: Assignee[];
    notes: string;
}

const families: FamilyVisit[] = [
    {
        id: 101,
        name: "Familia Hernandez",
        location: "Calle Principal #123",
        status: "visited",
    },
    {
        id: 102,
        name: "Familia Martinez",
        location: "Av. Las Torres, Lote 4",
        status: "pending",
    },
    {
        id: 103,
        name: "Familia Ruíz",
        location: "Callejón sin salida S/N",
        status: "pending",
    },
];

const visit: VisitDetailData = {
    id: "visit-123",
    routeTitle: "Ruta Lomas del Valle",
    assignees: [
        {
            id: "1",
            name: "Juan",
            avatarUrl: "https://github.com/mrzachnugent.png",
            initials: "ZN",
        },
        {
            id: "2",
            name: "Ana",
            avatarUrl: "https://github.com/leerob.png",
            initials: "LR",
        },
        {
            id: "3",
            name: "Pedro",
            avatarUrl: "https://github.com/evilrabbit.png",
            initials: "ER",
        },
    ],
    notes: "Recuerden llevar despensas extra para la Familia Ruíz. Verificar si ya tienen agua potable.",
};

const Page = () => {
    const getAssigneeLabel = (assignees: Assignee[]) => {
        const names = assignees.map((a) => a.name);

        if (names.length === 1) return `Asignado a ${names[0]}`;

        const last = names.pop();
        return `Asignado a ${names.join(", ")} y ${last}`;
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 gap-6">
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-400">
                            Detalles de la visita
                        </Text>
                        <Text variant="h2" className="border-b-0">
                            {visit.routeTitle}
                        </Text>

                        <View className="flex-row items-center gap-3">
                            <View className="flex-row">
                                {visit.assignees.map((assignee) => (
                                    <Avatar
                                        key={assignee.id}
                                        alt={assignee.initials}
                                        className="border-background -mr-2 border-2"
                                    >
                                        <AvatarImage
                                            source={{
                                                uri: assignee.avatarUrl,
                                            }}
                                        />
                                        <AvatarFallback>
                                            <Text>{assignee.initials}</Text>
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </View>
                            <Text className="text-gray-400">
                                {getAssigneeLabel(visit.assignees)}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <View className="flex-row items-center gap-2">
                            <Boxicon
                                name="bxs-note"
                                size={16}
                                color="#eab308"
                            />
                            <Text className="font-bold text-yellow-600">
                                Notas
                            </Text>
                        </View>
                        <Text className="text-yellow-800/70">
                            {visit.notes}
                        </Text>
                    </View>

                    <TouchableOpacity className="bg-primary w-full py-4 rounded-2xl flex-row justify-center items-center">
                        <Text className="text-white font-bold">
                            Iniciar Visita
                        </Text>
                        <Boxicon name="bxs-play" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="gap-3">
                    <View>
                        <Text variant="h3">Familias</Text>
                    </View>

                    <View className="gap-2">
                        {families.map((family, index) => (
                            <VisitFamilyCard
                                key={family.id}
                                index={index + 1}
                                family={family}
                            />
                        ))}
                    </View>

                    <View className="items-center">
                        <Text className="text-gray-400 text-xs">
                            Fin de la lista de asignación
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Page;
