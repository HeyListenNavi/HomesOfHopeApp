import React from "react";
import { View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FamilyVisit, VisitFamilyCard } from "@/components/FamilyVisitCard";
import { Interview } from "@/components/InterviewCard";
import ApplicantInterviewCard, {
    Applicant,
} from "@/components/ApplicantInterviewCard";

const interview: Interview = {
    id: "1",
    title: "Entrevista",
    date: "12 de Mes de 3456",
    time: "12:34 AM",
    familyCount: 123,
    locationName: "123",
    notes: "Notas",
};

const applicants: Applicant[] = [
    {
        id: "1",
        curp: "AAFA001112MPLMLZB1",
        name: "Familia Hernandez",
        location: "Tijuana / El Florido",
        phone: "664-000-0000",
        status: "Pendiente",
        aiContext: {
            income: "Low",
            housing: "Needs repair",
            notes: "Previously applied in 2023",
        },
    },
];

const Page = () => {
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 gap-6">
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-400">
                            Detalles de la entrevista
                        </Text>
                        <Text variant="h2" className="border-b-0">
                            {interview.title}
                        </Text>
                        <View className="flex-row items-center gap-2">
                            <View className="bg-[#61b346]/10 px-3 py-1 rounded-full">
                                <Text className="text-primary font-bold">
                                    {interview.time}
                                </Text>
                            </View>
                            <Text className="text-gray-400">
                                {interview.date}
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
                            {interview.notes}
                        </Text>
                    </View>
                </View>

                <View className="gap-3">
                    <View>
                        <Text variant="h3">Aplicantes</Text>
                    </View>

                    <View className="gap-2">
                        {applicants.map((applicant, index) => (
                            <ApplicantInterviewCard
                                key={index}
                                applicant={applicant}
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
