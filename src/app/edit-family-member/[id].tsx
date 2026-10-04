import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Input from "@/components/Input";
import Select from "@/components/Select";
import DatePickerInput from "@/components/DatePickerInput";
import YesNoToggle from "@/components/YesNoToggle";
import FluentEmoji from "@/components/FluentEmoji";
import Boxicon from "@/components/Boxicons";
import {
    RELATIONSHIP,
    MARITAL_STATUS,
    EDUCATION_LEVEL,
    OCCUPATION,
    RELIGION,
    INDIGENOUS_LANGUAGE,
    toOptions,
} from "@/lib/enums";
import {
    useFamilyMemberShow,
    useFamilyMemberUpdate,
    getFamilyMemberShowQueryKey,
    getFamilyProfileShowQueryKey,
} from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";
import type {
    FamilyMemberUpdateBody,
    Relationship,
    MaritalStatus,
    EducationLevel,
    Religion,
    Occupation,
} from "@/services/generated/apiTypes";
import EmptyState from "@/components/EmptyState";
import { Permission } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";

export default function EditFamilyMemberPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { bottom } = useSafeAreaInsets();
    const scrollViewRef = useRef<any>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    
    const [openSections, setOpenSections] = useState({
        personal: true,
        contact: true,
        work: true,
        roles: true,
        health: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((p) => ({ ...p, [section]: !p[section] }));
    };

    const memberId = Number(id);
    const queryClient = useQueryClient();
    const updateMutation = useFamilyMemberUpdate();
    const { can } = usePermissions();
    const allowed = usePermissionGuard(Permission.familyMemberUpdate);

    const {
        data: member,
        isPending: isDataLoading,
        isError,
    } = useFamilyMemberShow(memberId, {
        query: {
            enabled:
                !isNaN(memberId) && memberId > 0 && can(Permission.familyMemberUpdate),
        },
    });

    const [formData, setFormData] = useState({
        name: "",
        paternal_surname: "",
        maternal_surname: "",
        relationship: "padre",
        birth_date: "1995-01-01",
        curp: "",
        marital_status: "married",
        religion: "catholic",
        phone: "",
        origin_state: "Baja California",
        origin_country: "México",
        occupation: "",
        weekly_income: "",
        education_level: "elementary",
        education_grade: "",
        is_responsible: false as boolean | null,
        is_land_owner: false as boolean | null,
        is_pregnant: false as boolean | null,
        pregnancy_months: "",
        indigenous_language: "none",
        medical_notes: "",
    });

    const initialSnapshotRef = useRef<string>("");
    const dataLoadedRef = useRef(false);

    useEffect(() => {
        if (!member || dataLoadedRef.current) return;
        const initial = {
            name: member.name || "",
            paternal_surname: member.paternal_surname || "",
            maternal_surname: member.maternal_surname || "",
            relationship: member.relationship || "padre",
            birth_date: member.birth_date ? String(member.birth_date).split("T")[0] : "1995-01-01",
            curp: member.curp || "",
            marital_status: member.marital_status || "married",
            religion: member.religion || "catholic",
            phone: member.phone || "",
            origin_state: member.origin_state || "Baja California",
            origin_country: member.origin_country || "México",
            occupation: member.occupation || "",
            weekly_income: member.weekly_income ? String(member.weekly_income) : "",
            education_level: member.education_level || "elementary",
            education_grade: member.education_grade ? String(member.education_grade) : "",
            is_responsible: member.is_responsible ?? false,
            is_land_owner: member.is_land_owner ?? false,
            is_pregnant: member.is_pregnant ?? false,
            pregnancy_months: member.pregnancy_months ? String(member.pregnancy_months) : "",
            indigenous_language: member.indigenous_language || "none",
            medical_notes: member.medical_notes || "",
        };
        setFormData(initial);
        initialSnapshotRef.current = JSON.stringify(initial);
        dataLoadedRef.current = true;
    }, [member]);

    const isDirty = useMemo(() => {
        if (!initialSnapshotRef.current) return false;
        return JSON.stringify(formData) !== initialSnapshotRef.current;
    }, [formData]);

    const updateField = (field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    
    const validateForm = (): boolean => {
        const errs: Record<string, string> = {};
        if (!formData.name.trim()) errs["name"] = "El nombre es obligatorio.";
        if (!formData.paternal_surname.trim()) errs["paternal_surname"] = "El apellido paterno es requerido.";
        if (!formData.birth_date) errs["birth_date"] = "La fecha de nacimiento es requerida.";
        if (!formData.relationship) errs["relationship"] = "El parentesco es obligatorio.";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            scrollViewRef.current?.scrollTo?.({ y: 0, animated: true }) ||
                scrollViewRef.current?.scrollToPosition?.(0, 0, true);
            return;
        }

        setIsLoading(true);
        try {
            const payload: FamilyMemberUpdateBody = {
                name: formData.name,
                paternal_surname: formData.paternal_surname,
                maternal_surname: formData.maternal_surname || null,
                birth_date: formData.birth_date,
                curp: formData.curp || null,
                relationship: formData.relationship as Relationship,
                is_responsible: Boolean(formData.is_responsible),
                is_land_owner: Boolean(formData.is_land_owner),
                phone: formData.phone || null,
                occupation: (formData.occupation || null) as Occupation | null,
                marital_status: (formData.marital_status || null) as MaritalStatus | null,
                education_level: (formData.education_level || null) as EducationLevel | null,
                education_grade: formData.education_grade ? Number(formData.education_grade) : null,
                weekly_income: formData.weekly_income ? Number(formData.weekly_income) : null,
                religion: (formData.religion || null) as Religion | null,
                indigenous_language: formData.indigenous_language === "none" ? null : formData.indigenous_language,
                is_pregnant: formData.relationship === "padre" ? false : Boolean(formData.is_pregnant),
                pregnancy_months: formData.pregnancy_months ? Number(formData.pregnancy_months) : null,
                medical_notes: formData.medical_notes || null,
            };

            const updated = await updateMutation.mutateAsync({
                familyMember: memberId,
                data: payload,
            });

            await queryClient.invalidateQueries({ queryKey: getFamilyMemberShowQueryKey(memberId) });
            await queryClient.invalidateQueries({ queryKey: getFamilyProfileShowQueryKey(member?.family_profile_id ?? 0) });

            ToastAndroid.show("Familiar actualizado ✅", ToastAndroid.SHORT);
            router.replace(`/family-member/${updated.data?.id ?? memberId}` as any);
        } catch (err: any) {
            Alert.alert(
                "Error al Guardar",
                err?.response?.data?.message || "Ocurrió un error al actualizar los datos del familiar."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!allowed) return null;

    if (isDataLoading) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center">
                <ActivityIndicator size="large" color="#61b346" />
                <Text className="text-gray-500 font-bold text-base mt-3">
                    Cargando datos del familiar...
                </Text>
            </View>
        );
    }

    if (isError || !member) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center p-6 gap-3">
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

    return (
        <View className="flex-1 bg-gray-100">
            {}
            <KeyboardAwareScrollView
                ref={scrollViewRef}
                contentContainerClassName="p-6 pb-36 gap-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {}
                {Object.keys(errors).length > 0 && (
                    <View className="bg-red-50 border border-red-200 p-4 rounded-2xl flex-row items-start gap-3 shadow-sm">
                        <FluentEmoji emoji="⚠️" className="text-2xl mt-0.5 shrink-0" />
                        <View className="flex-1">
                            <Text className="text-red-800 font-extrabold text-base">
                                Hay campos requeridos pendientes
                            </Text>
                            <Text className="text-red-700 text-sm mt-0.5 leading-snug">
                                Por favor completa los campos marcados con asterisco rojo (*) para guardar los cambios.
                            </Text>
                        </View>
                    </View>
                )}

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("personal")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="👤" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Datos Personales
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Nombre, parentesco y datos básicos.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.personal ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.personal && (
                        <View className="p-6 gap-5 bg-white">
                            <Input
                                label="Nombre(s)"
                                placeholder="Ej. María Guadalupe"
                                required
                                value={formData.name}
                                onChangeText={(val) => updateField("name", val)}
                                error={errors["name"]}
                            />

                            <Input
                                label="Apellido Paterno"
                                placeholder="Ej. Hernández"
                                required
                                value={formData.paternal_surname}
                                onChangeText={(val) => updateField("paternal_surname", val)}
                                error={errors["paternal_surname"]}
                            />

                            <Input
                                label="Apellido Materno"
                                placeholder="Ej. Pérez"
                                optional
                                value={formData.maternal_surname}
                                onChangeText={(val) => updateField("maternal_surname", val)}
                            />

                            <Select
                                label="Parentesco"
                                options={toOptions(RELATIONSHIP)}
                                required
                                value={formData.relationship}
                                onValueChange={(val) => updateField("relationship", val)}
                            />

                            <DatePickerInput
                                label="Fecha de Nacimiento"
                                required
                                value={formData.birth_date}
                                onChange={(val) => updateField("birth_date", val)}
                            />

                            <Input
                                label="CURP"
                                placeholder="18 caracteres alfanuméricos"
                                optional
                                autoCapitalize="characters"
                                maxLength={18}
                                value={formData.curp}
                                onChangeText={(val) => updateField("curp", val)}
                            />

                            <Select
                                label="Estado Civil"
                                options={toOptions(MARITAL_STATUS)}
                                optional
                                value={formData.marital_status}
                                onValueChange={(val) => updateField("marital_status", val)}
                            />

                            <Select
                                label="Religión"
                                options={toOptions(RELIGION)}
                                optional
                                value={formData.religion}
                                onValueChange={(val) => updateField("religion", val)}
                            />
                        </View>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("contact")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="📞" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Contacto y Origen
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Teléfono y lugar de procedencia.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.contact ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.contact && (
                        <View className="p-6 gap-5 bg-white">
                            <Input
                                label="Teléfono"
                                placeholder="Ej. 664 123 4567"
                                optional
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(val) => updateField("phone", val)}
                            />

                            <Input
                                label="Estado de Origen"
                                placeholder="Ej. Baja California, Oaxaca, etc."
                                optional
                                value={formData.origin_state}
                                onChangeText={(val) => updateField("origin_state", val)}
                            />

                            <Input
                                label="País de Origen"
                                placeholder="Ej. México"
                                optional
                                value={formData.origin_country}
                                onChangeText={(val) => updateField("origin_country", val)}
                            />
                        </View>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("work")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="💼" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Trabajo y Estudios
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Ocupación, ingresos y nivel de escolaridad.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.work ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.work && (
                        <View className="p-6 gap-5 bg-white">
                            <Select
                                label="Ocupación"
                                options={toOptions(OCCUPATION)}
                                optional
                                value={formData.occupation}
                                onValueChange={(val) => updateField("occupation", val)}
                            />

                            <Input
                                label="Ingreso semanal"
                                placeholder="0"
                                prefix="$"
                                optional
                                keyboardType="numeric"
                                value={formData.weekly_income}
                                onChangeText={(val) => updateField("weekly_income", val)}
                            />

                            <Select
                                label="Escolaridad"
                                options={toOptions(EDUCATION_LEVEL)}
                                optional
                                value={formData.education_level}
                                onValueChange={(val) => updateField("education_level", val)}
                            />

                            {}
                            {formData.education_level !== "none" && Boolean(formData.education_level) && (
                                <Input
                                    label="Último grado cursado"
                                    placeholder="Ej. 3"
                                    optional
                                    keyboardType="numeric"
                                    value={formData.education_grade}
                                    onChangeText={(val) => updateField("education_grade", val)}
                                />
                            )}
                        </View>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("roles")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="⭐" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Responsabilidades
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Aplicante responsable y titularidad del terreno.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.roles ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.roles && (
                        <View className="p-6 gap-5 bg-white">
                            <YesNoToggle
                                label="¿Es el Aplicante Responsable?"
                                yesLabel="Sí, es responsable"
                                noLabel="No"
                                value={formData.is_responsible}
                                onChange={(val) => updateField("is_responsible", val)}
                            />

                            <YesNoToggle
                                label="¿Es dueño(a) del terreno?"
                                yesLabel="Sí, es dueño(a)"
                                noLabel="No"
                                value={formData.is_land_owner}
                                onChange={(val) => updateField("is_land_owner", val)}
                            />
                        </View>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("health")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="🩺" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Salud y Condiciones
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Embarazo, lengua indígena y notas médicas.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.health ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.health && (
                        <View className="p-6 gap-5 bg-white">
                            {}
                            {formData.relationship !== "padre" && (
                                <>
                                    <YesNoToggle
                                        label="¿Está embarazada?"
                                        yesLabel="Sí, embarazada"
                                        noLabel="No"
                                        yesColor="primary"
                                        noColor="gray"
                                        value={formData.is_pregnant}
                                        onChange={(val) => updateField("is_pregnant", val)}
                                    />

                                    {formData.is_pregnant && (
                                        <Input
                                            label="Meses de Embarazo"
                                            placeholder="Ej. 6"
                                            optional
                                            keyboardType="numeric"
                                            value={formData.pregnancy_months}
                                            onChangeText={(val) => updateField("pregnancy_months", val)}
                                        />
                                    )}
                                </>
                            )}

                            <Select
                                label="Lengua Indígena"
                                options={toOptions(INDIGENOUS_LANGUAGE)}
                                optional
                                value={formData.indigenous_language}
                                onValueChange={(val) => updateField("indigenous_language", val)}
                            />

                            <Input
                                label="Condición médica o discapacidad"
                                placeholder="Ej. diabetes, silla de ruedas..."
                                optional
                                value={formData.medical_notes}
                                onChangeText={(val) => updateField("medical_notes", val)}
                            />
                        </View>
                    )}
                </View>
            </KeyboardAwareScrollView>

            {}
            <View
                style={{ paddingBottom: Math.max(bottom, 16) }}
                className="bg-white border-t border-gray-100 px-6 pt-4 shadow-xl shadow-black/10 z-10"
            >
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading || !isDirty}
                    activeOpacity={0.85}
                    className={`w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg ${
                        isDirty
                            ? "bg-primary shadow-primary/30 active:opacity-90"
                            : "bg-gray-300 shadow-none"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel={isDirty ? "Guardar Cambios" : "Sin cambios por guardar"}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <>
                            <Text
                                className={`font-black text-lg ${
                                    isDirty ? "text-white" : "text-gray-500"
                                }`}
                            >
                                {isDirty ? "Guardar Cambios" : "Sin cambios pendientes"}
                            </Text>
                            <Boxicon
                                name={isDirty ? "bxs-save" : "bx-check"}
                                size={22}
                                color={isDirty ? "#ffffff" : "#9ca3af"}
                            />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
