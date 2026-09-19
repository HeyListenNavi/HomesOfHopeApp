import React from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    ToastAndroid,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import BrandBoxicon from "@/components/BrandBoxicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import InfoRow from "@/components/InfoRow";
import FluentEmoji from "@/components/FluentEmoji";
import SectionHeader from "@/components/SectionHeader";
import { formatDate } from "@/lib/utils";
import {
    RELATIONSHIP,
    MARITAL_STATUS,
    EDUCATION_LEVEL,
    RELIGION,
    OCCUPATION,
    INDIGENOUS_LANGUAGE,
    DOCUMENT,
} from "@/lib/enums";
import { DocumentResource } from "@/services/generated/apiTypes";
import { useFamilyMemberShow } from "@/services/generated/apiEndpoints";
import { useScreenTopPadding } from "@/lib/layout";
import EmptyState from "@/components/EmptyState";

const getAge = (dateString?: string | null) => {
    if (!dateString) return "?";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }
    return age;
};

export default function FamilyMemberPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const topPadding = useScreenTopPadding();

    const memberId = Number(id);
    const {
        data: member,
        isPending,
        isError,
        refetch,
        isFetching,
    } = useFamilyMemberShow(memberId, {
        query: {
            enabled: !isNaN(memberId) && memberId > 0,
        },
    });

    if (isPending) {
        return (
            <View
                className="flex-1 bg-gray-100 items-center justify-center"
                style={{ paddingTop: topPadding }}
            >
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    if (isError || !member) {
        return (
            <View
                className="flex-1 bg-gray-100 items-center justify-center p-6 gap-3"
                style={{ paddingTop: topPadding }}
            >
                <EmptyState
                    emoji="🔍"
                    title="Integrante no encontrado"
                    subtitle="No se pudieron cargar los datos del integrante."
                />
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-primary px-6 py-3.5 rounded-2xl mt-4 active:opacity-90"
                    accessibilityRole="button"
                    accessibilityLabel="Regresar"
                >
                    <Text className="text-white font-bold text-base">Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const cleanPhone = member.phone ? member.phone.replace(/[^0-9+]/g, "") : "";

    const handleWhatsApp = async () => {
        if (cleanPhone) {
            try {
                await Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
            } catch {
                try {
                    await Linking.openURL(`https://wa.me/${cleanPhone}`);
                } catch {
                    ToastAndroid.show("No se pudo abrir WhatsApp.", ToastAndroid.SHORT);
                }
            }
        }
    };

    const handleCall = async () => {
        if (cleanPhone) {
            try {
                await Linking.openURL(`tel:${cleanPhone}`);
            } catch {
                ToastAndroid.show("No se pudo iniciar la llamada.", ToastAndroid.SHORT);
            }
        }
    };

    const handleEditMember = () => {
        router.push(`/edit-family-member/${member.id}` as any);
    };

    const memberDocs: DocumentResource[] = member.documents || [];

    const occupationDisplay = member.occupation
        ? OCCUPATION[member.occupation]?.label ?? member.occupation
        : "No especificada";

    const indigenousLangDisplay = member.indigenous_language
        ? INDIGENOUS_LANGUAGE[member.indigenous_language]?.label ?? member.indigenous_language
        : member.indigenous_language;

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView
                className="flex-1 bg-gray-100"
                contentContainerClassName="p-6 pb-28 gap-6"
                contentContainerStyle={{ paddingTop: topPadding }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        tintColor="#61b346"
                        colors={["#61b346"]}
                    />
                }
            >
                {}
                <View className="bg-white rounded-3xl p-6 shadow-md shadow-black/5 items-center gap-5 relative">
                    <TouchableOpacity
                        onPress={handleEditMember}
                        activeOpacity={0.8}
                        className="absolute top-5 right-5 h-11 w-11 bg-primary/10 rounded-2xl items-center justify-center active:bg-primary/20"
                        accessibilityRole="button"
                        accessibilityLabel="Editar Integrante"
                    >
                        <Boxicon name="bxs-edit" size={22} color="#61b346" />
                    </TouchableOpacity>

                    <View className="h-24 w-24 rounded-full bg-primary/10 items-center justify-center border-2 border-primary/20 mt-1">
                        <FluentEmoji
                            emoji={
                                member.relationship === "padre" || member.relationship === "abuelo"
                                    ? "👨"
                                    : member.relationship === "madre"
                                        ? "👩"
                                        : member.relationship === "hijo"
                                            ? "🧒"
                                            : "👤"
                            }
                            className="text-5xl"
                        />
                    </View>

                    <View className="items-center gap-2">
                        <Text className="text-2xl font-bold text-gray-800 text-center leading-tight">
                            {member.name} {member.paternal_surname} {member.maternal_surname || ""}
                        </Text>

                        {}
                        <View className="flex-row items-center justify-center gap-2 flex-wrap">
                            <Badge className="bg-gray-100 border-transparent px-3 py-1.5 rounded-full">
                                <Text className="text-gray-700 font-bold text-sm">
                                    {member.relationship ? RELATIONSHIP[member.relationship]?.label ?? member.relationship : "Familiar"}
                                </Text>
                            </Badge>

                            {member.is_responsible && (
                                <Badge className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full">
                                    <View className="flex-row items-center gap-1">
                                        <FluentEmoji emoji="⭐" className="text-sm" />
                                        <Text className="text-primary font-bold text-sm">
                                            Responsable
                                        </Text>
                                    </View>
                                </Badge>
                            )}

                            {member.is_land_owner && (
                                <Badge className="bg-blue-100 border-transparent px-3 py-1.5 rounded-full">
                                    <View className="flex-row items-center gap-1">
                                        <FluentEmoji emoji="📜" className="text-sm" />
                                        <Text className="text-blue-700 font-bold text-sm">
                                            Dueño(a) Terreno
                                        </Text>
                                    </View>
                                </Badge>
                            )}

                            {member.is_pregnant && member.relationship !== "padre" && (
                                <Badge className="bg-pink-100 border-transparent px-3 py-1.5 rounded-full">
                                    <View className="flex-row items-center gap-1">
                                        <FluentEmoji emoji="🤰" className="text-sm" />
                                        <Text className="text-pink-700 font-bold text-sm">
                                            Embarazo ({member.pregnancy_months || "?"} m)
                                        </Text>
                                    </View>
                                </Badge>
                            )}
                        </View>
                    </View>

                    {}
                    {cleanPhone ? (
                        <View className="w-full pt-4 border-t border-gray-100 flex-row items-center gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-100 px-4 py-4 rounded-2xl flex-row justify-center items-center gap-2 active:bg-gray-200"
                                onPress={handleCall}
                                accessibilityRole="button"
                                accessibilityLabel="Llamar"
                            >
                                <Boxicon name="bxs-phone" size={20} color="#6b7280" />
                                <Text className="text-gray-700 font-bold text-base">Llamar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-primary px-4 py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                                onPress={handleWhatsApp}
                                accessibilityRole="button"
                                accessibilityLabel="WhatsApp"
                            >
                                <BrandBoxicon name="bx-whatsapp" size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-base">WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="👤" title="Datos Personales" />
                    <View className="gap-3">
                        <InfoRow
                            label="Fecha de Nacimiento"
                            value={formatDate(member.birth_date)}
                            description={`${getAge(member.birth_date)} años`}
                        />
                        <InfoRow
                            label="CURP"
                            value={member.curp?.toUpperCase() || "No registrado"}
                        />
                        <InfoRow
                            label="Estado Civil"
                            value={
                                member.marital_status
                                    ? MARITAL_STATUS[member.marital_status]?.label ?? member.marital_status
                                    : "No especificado"
                            }
                        />
                        <InfoRow
                            label="Religión"
                            value={
                                member.religion
                                    ? RELIGION[member.religion]?.label ?? member.religion
                                    : "No especificada"
                            }
                        />
                    </View>
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="📞" title="Contacto y Origen" />
                    <View className="gap-3">
                        <InfoRow
                            label="Teléfono"
                            value={member.phone || "No registrado"}
                        />
                        <InfoRow
                            label="Estado de Origen"
                            value={member.origin_state || "No registrado"}
                        />
                        <InfoRow
                            label="País de Origen"
                            value={member.origin_country || "México"}
                        />
                    </View>
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="💼" title="Trabajo y Estudios" />
                    <View className="gap-3">
                        <InfoRow
                            label="Ocupación"
                            value={occupationDisplay}
                        />
                        <InfoRow
                            label="Ingreso Semanal"
                            value={
                                member.weekly_income
                                    ? `$${Number(member.weekly_income).toLocaleString()} MXN`
                                    : "No registrado"
                            }
                        />
                        <InfoRow
                            label="Nivel Educativo"
                            value={
                                member.education_level
                                    ? EDUCATION_LEVEL[member.education_level]?.label ?? member.education_level
                                    : "No especificado"
                            }
                        />
                        {member.education_grade && (
                            <InfoRow
                                label="Último Grado Cursado"
                                value={`Grado ${member.education_grade}`}
                            />
                        )}
                    </View>
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                    <SectionHeader emoji="🏥" title="Salud y Condiciones" />
                    <View className="gap-3">
                        <InfoRow
                            label="¿Habla lengua indígena?"
                            value={member.speaks_indigenous_language ? "Sí" : "No"}
                        />
                        {member.speaks_indigenous_language && member.indigenous_language && (
                            <InfoRow
                                label="Lengua Indígena"
                                value={indigenousLangDisplay || member.indigenous_language}
                            />
                        )}
                        <InfoRow
                            label="¿Es dueño(a) del terreno?"
                            value={member.is_land_owner ? "Sí" : "No"}
                        />
                        {member.is_pregnant && member.relationship !== "padre" && (
                            <InfoRow
                                label="Embarazo"
                                value={`Sí (${member.pregnancy_months || "?"} meses)`}
                            />
                        )}

                        {member.medical_notes && (
                            <View className="bg-red-50 border border-red-200 p-4 rounded-2xl gap-1 mt-1">
                                <View className="flex-row items-center gap-2">
                                    <FluentEmoji emoji="⚠️" className="text-xl" />
                                    <Text className="text-red-800 font-extrabold text-base">
                                        Condición Médica o Discapacidad
                                    </Text>
                                </View>
                                <Text className="text-red-900 text-base font-medium leading-relaxed">
                                    {member.medical_notes}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4">
                    <SectionHeader
                        emoji="📄"
                        title="Documentos"
                        action={
                            <TouchableOpacity
                                className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-70"
                                onPress={() => router.push(`/new-document/${member.id}?documentable_type=family_member` as any)}
                                accessibilityRole="button"
                                accessibilityLabel="Subir documento"
                            >
                                <Boxicon name="bx-plus" size={16} color="#61b346" />
                                <Text className="text-primary font-bold text-sm">Subir</Text>
                            </TouchableOpacity>
                        }
                    />
                    {memberDocs.length > 0 ? (
                        <View className="gap-3">
                            {memberDocs.map((doc: DocumentResource) => (
                                <TouchableOpacity
                                    key={doc.id}
                                    className="flex-row items-center gap-4 py-1 active:opacity-70"
                                    onPress={() => Linking.openURL(doc.url)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Abrir ${DOCUMENT[doc.document_type]?.label ?? doc.document_type}`}
                                >
                                    <View className="h-14 w-14 bg-gray-100 rounded-2xl items-center justify-center shrink-0">
                                        <Boxicon name="bxs-file" size={24} color="#9ca3af" />
                                    </View>
                                    <View className="flex-1 gap-0.5">
                                        <Text className="font-bold text-gray-800 text-lg">
                                            {DOCUMENT[doc.document_type]?.label ?? doc.document_type}
                                        </Text>
                                        {doc.description && (
                                             <Text className="text-gray-500 text-base font-medium" numberOfLines={1}>
                                                {doc.description}
                                            </Text>
                                        )}
                                        <Text className="text-gray-400 text-sm font-medium">
                                            {doc.original_name}
                                        </Text>
                                    </View>
                                    <Boxicon name="bx-chevron-right" size={24} color="#d1d5db" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text className="text-gray-400 text-sm font-medium italic">
                            No hay documentos registrados para este integrante.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
