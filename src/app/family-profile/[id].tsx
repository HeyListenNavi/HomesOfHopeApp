import React from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image
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
import { FamilyMember, Document } from "@/types/api";

import { useFamily } from "@/hooks/useFamilies";

// Diccionarios para traducir las llaves del backend a etiquetas legibles
const ROLE_LABELS: Record<string, string> = {
    padre: 'Padre de Familia',
    madre: 'Madre de Familia',
    hijo: 'Hijo(a)',
    abuelo: 'Abuelo(a)',
    nieto: 'Nieto(a)',
    otro: 'Otro / Relación no especificada'
};

const DOC_LABELS: Record<string, string> = {
    ine: '🆔 INE / Identificación',
    curp: '📄 CURP',
    proof_of_address: '🏠 Comprobante Domicilio',
    contract: '✍️ Contrato',
    report: '📊 Reporte / Estudio',
    photo: '📷 Fotografía',
    other: '📂 Documento Anexo'
};

const Page = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const { data: family, isLoading, isError } = useFamily(Number(id));

    const getAge = (dateString?: string | null) => {
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

    // Clasificación de miembros según las llaves exactas del backend
    const parents = family.members?.filter((m: FamilyMember) => ['padre', 'madre'].includes(m.relationship)) || [];
    const children = family.members?.filter((m: FamilyMember) => m.relationship === 'hijo') || [];
    const others = family.members?.filter((m: FamilyMember) => ['abuelo', 'nieto', 'otro'].includes(m.relationship)) || [];

    // Buscar si existe un documento clasificado como foto principal para la cabecera
    const familyPhotoDoc = family.documents?.find((d: Document) => d.document_type === 'photo');

    // Componente reutilizable para renderizar cualquier tipo de miembro
    const renderMember = (member: FamilyMember) => (
        <View key={member.id} className="gap-2 border-b border-gray-100 pb-3 mb-1">
            <View className="flex-row items-center justify-between">
                <Text className="font-bold text-gray-700 flex-1">
                    {member.name} {member.paternal_surname} {member.maternal_surname || ''}
                </Text>
                {member.is_responsible ? (
                    <View className="bg-primary/10 px-2 py-1 rounded-md">
                        <Text className="text-primary text-xs font-bold">Responsable</Text>
                    </View>
                ) : null}
            </View>
            
            <View className="flex-row gap-1 mt-1">
                <View className="flex-1">
                    <InfoRow label="Edad" value={`${getAge(member.birth_date)} años`} />
                </View>
                <View className="flex-1">
                    <InfoRow label="CURP" value={member.curp?.toUpperCase() || "N/A"} />
                </View>
            </View>
            
            <View className="flex-row gap-1">
                <View className="flex-1">
                    <InfoRow label="Ocupación" value={member.occupation || "N/A"} />
                </View>
                <View className="flex-1">
                    <InfoRow label="Teléfono" value={member.phone || "N/A"} />
                </View>
            </View>

            {member.medical_notes ? (
                <View className="mt-1 bg-red-50 p-2 rounded-lg">
                    <Text className="text-red-800 text-xs font-bold">🏥 Ficha Médica:</Text>
                    <Text className="text-red-700 text-sm mt-1">{member.medical_notes}</Text>
                </View>
            ) : null}
        </View>
    );

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-4 pb-20 gap-4"
            showsVerticalScrollIndicator={false}
        >
            {/* Cabecera / Fotografía */}
            <View className="bg-white rounded-2xl overflow-hidden">
                {familyPhotoDoc && familyPhotoDoc.url ? (
                    <Image 
                        source={{ uri: familyPhotoDoc.url }} 
                        className="w-full h-80 bg-gray-200"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="h-80 bg-gray-200 items-center justify-center">
                        <Boxicon name="bxs-image" size={48} color="#9ca3af" />
                        <Text className="w-full text-center text-gray-400 mt-2">
                            Sin Fotografía Registrada
                        </Text>
                    </View>
                )}

                <View className="p-6 bg-white gap-6">
                    <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                            <Text variant="h2" className="flex-1 text-primary font-bold py-0 border-b-transparent">
                                {family.family_name}
                            </Text>
                            
                            {/* Menú de Acciones */}
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
                                        <Text className="text-gray-600 text-base">Editar Familia</Text>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </View>

                        <View className="gap-2">
                            <View className="flex-1 flex-row items-center gap-1">
                                <Boxicon name="bxs-location" size={16} color="#9ca3af" />
                                <Text className="text-gray-400 text-sm">
                                    {family.construction_address ?? "Sin dirección de terreno"}
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

            {/* Padres y Tutores */}
            <DetailSectionCard title="Padres y Tutores" icon="bxs-group">
                <View className="gap-2">
                    {parents.length > 0 ? (
                        parents.map(renderMember)
                    ) : (
                        <Text className="text-gray-500 italic py-2">No hay padres registrados.</Text>
                    )}
                </View>
            </DetailSectionCard>

            {/* Hijos */}
            <DetailSectionCard title="Hijos" icon="bxs-child">
                <View className="gap-2">
                    {children.length > 0 ? (
                        children.map(renderMember)
                    ) : (
                        <Text className="text-gray-500 italic py-2">No hay hijos registrados.</Text>
                    )}
                </View>
            </DetailSectionCard>

            {/* Otros Familiares (Oculto si está vacío) */}
            {others.length > 0 && (
                <DetailSectionCard title="Otros Familiares" icon="bxs-user-plus">
                    <View className="gap-2">
                        {others.map((member) => (
                            <View key={member.id}>
                                <Text className="text-xs text-primary font-bold mb-1 uppercase tracking-wider">
                                    {ROLE_LABELS[member.relationship] || member.relationship}
                                </Text>
                                {renderMember(member)}
                            </View>
                        ))}
                    </View>
                </DetailSectionCard>
            )}

            {/* Información de Vivienda */}
            <DetailSectionCard title="Detalles de Vivienda" icon="bxs-home-heart">
                <View className="gap-3">
                    <InfoRow label="Dirección Actual" value={family.current_address || "No registrada"} />
                    <InfoRow label="Terreno (Construcción)" value={family.construction_address || "No registrada"} />
                    {family.general_observations ? (
                        <View className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Text className="text-gray-700 font-bold mb-1 text-sm">Observaciones Generales</Text>
                            <Text className="text-gray-600">{family.general_observations}</Text>
                        </View>
                    ) : null}
                </View>
            </DetailSectionCard>

            {/* Documentos */}
            <DetailSectionCard title="Documentos Adjuntos" icon="bxs-folder-open">
                <View className="gap-3">
                    {family.documents && family.documents.length > 0 ? (
                        family.documents.map((doc: Document) => (
                            <View key={doc.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <Text className="font-bold text-gray-700 mb-1">
                                    {DOC_LABELS[doc.document_type] || doc.document_type}
                                </Text>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-sm text-gray-500 flex-1 mr-2" numberOfLines={1}>
                                        {doc.original_name || "Archivo sin nombre"}
                                    </Text>
                                    <Text className="text-xs text-gray-400">
                                        {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ''}
                                    </Text>
                                </View>
                                {/* Asumimos que DocumentPreviewer puede tomar una url para visualizar o descargar */}
                                <View className="mt-2">
                                    <DocumentPreviewer 
                                        label="Ver Documento" 
                                        url={doc.url} 
                                    />
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic py-2">No hay documentos registrados.</Text>
                    )}
                </View>
            </DetailSectionCard>
        </ScrollView>
    );
};

export default Page;