import React from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import DocumentPreviewer from "@/components/DocumentPreviewer";
import { formatDate } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalSearchParams, useRouter } from "expo-router";
import DetailSectionCard from "@/components/DetailSectionCard";
import InfoRow from "@/components/InfoRow";
import { Member, Document } from "@/types/api";

// 1. Import the specific hook for a single family
import { useFamily } from "@/hooks/useFamilies";

const Page = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // 2. Fetch data automatically. 
    // We convert 'id' to Number because URL params are always strings.
    const { data: family, isLoading, isError } = useFamily(Number(id));

    // 3. Logic to calculate age (moved here for cleaner render)
    const getAge = (dateString: string) => {
        if (!dateString) return "?";
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#61b346" />
                <Text className="mt-4 text-gray-500">Cargando perfil...</Text>
            </View>
        );
    }

    if (isError || !family) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100 p-6">
                <Boxicon name="bxs-x-circle" size={48} color="#ef4444" />
                <Text className="mt-4 text-gray-500 text-center">
                    No se pudo cargar el perfil. Puede que haya sido eliminado o no tengas conexión.
                </Text>
            </View>
        );
    }

    // 4. Derived state (Safe to run now because we know 'family' exists)
    const children = family.members?.filter((m: Member) =>
        m.relationship?.toLowerCase().includes("hijo")
    ) || [];

    const parents = family.members?.filter((m: Member) =>
        ["padre", "madre", "tutor"].some(role => m.relationship?.toLowerCase().includes(role))
    ) || [];

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-4 pb-20 gap-4"
            showsVerticalScrollIndicator={false}
        >
            {/* Header / Photo Section */}
            <View className="bg-white rounded-2xl">
                <View className="h-80 bg-gray-200 items-center justify-center">
                    <Boxicon name="bxs-image" size={48} color="#9ca3af" />
                    <Text className="w-full text-center text-gray-400 mt-2">
                        Fotografía Familiar
                    </Text>
                </View>
                <View className="p-6 bg-white rounded-2xl rounded-t-none gap-6">
                    <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                            <Text
                                variant="h2"
                                className="flex-1 text-primary font-bold py-0 border-b-transparent"
                            >
                                {family.family_name}
                            </Text>
                            
                            {/* Actions Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <TouchableOpacity className="p-1">
                                        <Boxicon name="bxs-dots-vertical-rounded" size={28} color="#9ca3af" />
                                    </TouchableOpacity>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white rounded-2xl shadow-lg">
                                    <DropdownMenuItem 
                                        onPress={() => router.push(`/new-family-profile/${family.id}`)}
                                        className="flex-row gap-2 items-center p-3"
                                    >
                                        <Boxicon name="bxs-edit" size={20} color="#4b5563" />
                                        <Text className="text-gray-600 text-base">Editar</Text>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </View>

                        {/* Quick Info */}
                        <View className="gap-2">
                            <View className="flex-1 flex-row items-center gap-1">
                                <Boxicon name="bxs-location" size={16} color="#9ca3af" />
                                <Text className="text-gray-400 text-sm">
                                    {family.construction_address ?? "Sin dirección"}
                                </Text>
                            </View>
                            <View className="flex-1 flex-row items-center gap-1">
                                <Boxicon name="bxs-clock" size={16} color="#9ca3af" />
                                <Text className="text-gray-400 text-sm">
                                    Registrado: {formatDate(family.opened_at) ?? "N/A"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Parents Section */}
            <DetailSectionCard title="Padres y Tutores" icon="bxs-man-woman">
                <View className="gap-3">
                    {parents.length > 0 ? (
                        parents.map((parent: Member) => (
                            <View key={parent.id} className="gap-2">
                                <Text className="font-bold text-gray-700">
                                    {parent.name} {parent.paternal_surname}
                                </Text>
                                <View className="flex-row gap-1">
                                    <View className="flex-1">
                                        <InfoRow
                                            value={`${getAge(parent.birth_date)} años`}
                                            label="Edad"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <InfoRow
                                            value={parent.curp?.toUpperCase() || "N/A"}
                                            label="CURP"
                                        />
                                    </View>
                                </View>
                                <View className="flex-row gap-1">
                                    <View className="flex-1">
                                        <InfoRow
                                            label="Trabajo"
                                            value={parent.occupation || "No"}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <InfoRow
                                            className="capitalize"
                                            label="Relación"
                                            value={parent.relationship}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic py-2">
                            No hay padres registrados.
                        </Text>
                    )}
                </View>
            </DetailSectionCard>

            {/* Children Section */}
            <DetailSectionCard title="Hijos" icon="bxs-child">
                <View className="gap-3">
                    {children.length > 0 ? (
                        children.map((child: Member) => (
                            <View key={child.id} className="gap-2">
                                <Text className="font-bold text-gray-700">
                                    {child.name} {child.paternal_surname}
                                </Text>
                                <View className="flex-row gap-1">
                                    <View className="flex-1">
                                        <InfoRow
                                            value={`${getAge(child.birth_date)} años`}
                                            label="Edad"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <InfoRow
                                            value={child.curp?.toUpperCase() || "N/A"}
                                            label="CURP"
                                        />
                                    </View>
                                </View>
                                <InfoRow
                                    label="Trabajo Infantil"
                                    value={child.occupation || "No"}
                                />
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic py-2">
                            No hay hijos registrados.
                        </Text>
                    )}
                </View>
            </DetailSectionCard>

            {/* Land Info */}
            <DetailSectionCard title="Terreno" icon="bxs-location">
                <View className="flex-row gap-1">
                    <View className="flex-1">
                        <InfoRow
                            label="Ubicación"
                            value={family.construction_address || "No registrada"}
                        />
                    </View>
                </View>
            </DetailSectionCard>

            {/* Current Housing */}
            {family.current_address ? (
                <DetailSectionCard title="Vivienda Actual" icon="bxs-home-alt">
                    <InfoRow
                        label="Ubicación"
                        value={family.current_address}
                    />
                </DetailSectionCard>
            ) : (
                <DetailSectionCard title="Vivienda Actual" icon="bxs-home">
                    <Text className="text-gray-500 italic">
                        Viven actualmente en el terreno de construcción
                    </Text>
                </DetailSectionCard>
            )}

            {/* Documents */}
            <DetailSectionCard title="Documentos" icon="bxs-file-detail">
                <View className="gap-4">
                    {family.documents && family.documents.length > 0 ? (
                        family.documents.map((document: Document) => (
                            <View key={document.id} className="gap-2">
                                <DocumentPreviewer
                                    label={document.document_type}
                                />
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic py-2">
                            No hay documentos registrados.
                        </Text>
                    )}
                </View>
            </DetailSectionCard>
        </ScrollView>
    );
};

export default Page;