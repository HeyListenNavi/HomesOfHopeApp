import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import SectionHeader from "@/components/SectionHeader";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import DatePickerInput from "@/components/DatePickerInput";
import YesNoToggle from "@/components/YesNoToggle";
import NumberStepper from "@/components/NumberStepper";
import DocumentUploadCard, {
    UploadedFileAsset,
} from "@/components/DocumentUploadCard";
import FluentEmoji from "@/components/FluentEmoji";
import Boxicon from "@/components/Boxicons";
import LocationMapPreview from "@/components/LocationMapPreview";
import LocationPickerModal, {
    LocationPickerResult,
} from "@/components/LocationPickerModal";
import {
    RELATIONSHIP,
    MARITAL_STATUS,
    OCCUPATION,
    EDUCATION_LEVEL,
    RELIGION,
    INDIGENOUS_LANGUAGE,
    LAND_SERVICES,
    HOUSING_STATUS,
    CURRENCY,
    CITY,
    toOptions,
} from "@/lib/enums";
import { useFamilyProfileStore } from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";

export interface LivewireFamilyMember {
    id: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    relationship: string;
    birth_date: string;
    curp: string;
    phone: string;
    occupation: string;
    marital_status: string;
    education_level: string;
    education_grade: string;
    weekly_income: string;
    origin_state: string;
    origin_country: string;
    religion: string;
    speaks_indigenous_language: boolean;
    indigenous_language: string;
    is_pregnant: boolean;
    pregnancy_months: string;
    medical_notes: string;
    is_land_owner: boolean;
    is_responsible: boolean;
    identification: UploadedFileAsset | string | null;
    birth_certificate: UploadedFileAsset | string | null;
    income_proof: UploadedFileAsset | string | null;
}

const createDefaultMember = (index: number): LivewireFamilyMember => ({
    id: Math.random().toString(36).substring(7),
    name: "",
    paternal_surname: "",
    maternal_surname: "",
    relationship: index === 0 ? "padre" : "hijo",
    birth_date: "1995-01-01",
    curp: "",
    phone: "",
    occupation: "",
    marital_status: "married",
    education_level: "elementary",
    education_grade: "",
    weekly_income: "",
    origin_state: "Baja California",
    origin_country: "México",
    religion: "catholic",
    speaks_indigenous_language: false,
    indigenous_language: "nahuatl",
    is_pregnant: false,
    pregnancy_months: "",
    medical_notes: "",
    is_land_owner: index === 0,
    is_responsible: index === 0,
    identification: null,
    birth_certificate: null,
    income_proof: null,
});

export default function NewFamilyProfilePage() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const scrollViewRef = useRef<any>(null);
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    
    const [mapPickerTarget, setMapPickerTarget] = useState<"land" | "home" | null>(null);

    
    const [family, setFamily] = useState({
        name: "",
        lives_on_land: true as boolean | null,
        member_count: 1,
        has_addictions: false as boolean | null,
        addictions_details: "",
    });

    const [land, setLand] = useState({
        city: "Tijuana",
        colony: "",
        address: "",
        lat: null as number | null,
        lng: null as number | null,
        ownership_time: "",
        is_flat: true as boolean | null,
        currency: "mxn",
        total_cost: "",
        down_payment: "",
        monthly_payment: "",
        last_payment_date: "",
        is_up_to_date: true as boolean | null,
        services: ["electricity", "water"] as string[],
    });

    const [home, setHome] = useState({
        city: "Tijuana",
        colony: "",
        address: "",
        lat: null as number | null,
        lng: null as number | null,
        status: "rented",
        ownership_time: "",
        owner_name: "",
        monthly_rent: "",
        monthly_rent_currency: "mxn",
        has_receipts: false as boolean | null,
        description: "",
    });

    const [members, setMembers] = useState<LivewireFamilyMember[]>([
        createDefaultMember(0),
    ]);

    const [docs, setDocs] = useState({
        family_photo: null as UploadedFileAsset | string | null,
        land_ownership: null as UploadedFileAsset | string | null,
        land_receipts: [] as (UploadedFileAsset | string)[],
    });

    
    const handleMemberCountChange = (count: number) => {
        const clamped = Math.max(1, count);
        setFamily((prev) => ({ ...prev, member_count: clamped }));

        setMembers((prev) => {
            if (clamped > prev.length) {
                const added: LivewireFamilyMember[] = [];
                for (let i = prev.length; i < clamped; i++) {
                    added.push(createDefaultMember(i));
                }
                return [...prev, ...added];
            } else if (clamped < prev.length) {
                return prev.slice(0, clamped);
            }
            return prev;
        });
    };

    
    const flowSteps = useMemo(() => {
        const steps: { type: "family" | "land" | "home" | "member_upload" | "member_review" | "general_docs"; index?: number }[] = [];
        steps.push({ type: "family" });
        steps.push({ type: "land" });
        if (family.lives_on_land === false) {
            steps.push({ type: "home" });
        }
        for (let i = 0; i < family.member_count; i++) {
            steps.push({ type: "member_upload", index: i });
            steps.push({ type: "member_review", index: i });
        }
        steps.push({ type: "general_docs" });
        return steps;
    }, [family.lives_on_land, family.member_count]);

    const totalSteps = flowSteps.length;
    const currentStepDef = flowSteps[step - 1];

    useEffect(() => {
        setErrors({});
    }, [step]);

    const getStepEmoji = () => {
        if (currentStepDef.type === "family") return "🏠";
        if (currentStepDef.type === "land") return "📍";
        if (currentStepDef.type === "home") return "🏡";
        if (currentStepDef.type === "member_upload") return "📇";
        if (currentStepDef.type === "member_review") return "👤";
        if (currentStepDef.type === "general_docs") return "📸";
        return "📋";
    };

    const getStepTitle = () => {
        if (currentStepDef.type === "family") return "Datos de la Familia";
        if (currentStepDef.type === "land") return "Datos del Terreno";
        if (currentStepDef.type === "home") return "Casa Actual";
        if (currentStepDef.type === "member_upload") {
            const idx = currentStepDef.index ?? 0;
            const name = members[idx]?.name || (idx === 0 ? "Aplicante" : `Familiar ${idx + 1}`);
            return `Documentos de ${name}`;
        }
        if (currentStepDef.type === "member_review") {
            const idx = currentStepDef.index ?? 0;
            const name = members[idx]?.name || (idx === 0 ? "Aplicante" : `Familiar ${idx + 1}`);
            return `Datos de ${name}`;
        }
        if (currentStepDef.type === "general_docs") return "Fotos y Documentos";
        return "";
    };

    
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollViewRef.current?.scrollTo?.({ y: 0, animated: true }) ||
                scrollViewRef.current?.scrollToPosition?.(0, 0, true);
        }, 50);
        return () => clearTimeout(timer);
    }, [step]);

    
    const updateMemberField = (index: number, field: keyof LivewireFamilyMember, val: any) => {
        setMembers((prev) => {
            const next = [...prev];
            if (next[index]) {
                next[index] = { ...next[index], [field]: val };
            }
            return next;
        });
    };

    
    const handleLocationConfirm = (result: LocationPickerResult) => {
        const resolvedAddress = result.address || (result.plusCode ? `Plus Code: ${result.plusCode}` : "");
        if (mapPickerTarget === "land") {
            setLand((prev) => ({
                ...prev,
                lat: result.latitude,
                lng: result.longitude,
                address: resolvedAddress || prev.address,
                colony: result.colony || prev.colony,
                city: result.city || prev.city,
            }));
        } else if (mapPickerTarget === "home") {
            setHome((prev) => ({
                ...prev,
                lat: result.latitude,
                lng: result.longitude,
                address: resolvedAddress || prev.address,
                colony: result.colony || prev.colony,
                city: result.city || prev.city,
            }));
        }
        setMapPickerTarget(null);
    };

    
    const toggleLandService = (svcKey: string) => {
        setLand((prev) => {
            const exists = prev.services.includes(svcKey);
            return {
                ...prev,
                services: exists
                    ? prev.services.filter((s) => s !== svcKey)
                    : [...prev.services, svcKey],
            };
        });
    };

    
    const validateCurrentStep = (): boolean => {
        const errs: Record<string, string> = {};

        if (currentStepDef.type === "family") {
            if (!family.name.trim()) errs["family.name"] = "El apellido o nombre familiar es requerido.";
            if (family.lives_on_land === null) errs["family.lives_on_land"] = "Selecciona si viven en el terreno.";
        } else if (currentStepDef.type === "land") {
            if (!land.city) errs["land.city"] = "La ciudad es requerida.";
            if (!land.colony.trim()) errs["land.colony"] = "La colonia es requerida.";
        } else if (currentStepDef.type === "home") {
            if (!home.city) errs["home.city"] = "La ciudad es requerida.";
            if (!home.colony.trim()) errs["home.colony"] = "La colonia es requerida.";
        } else if (currentStepDef.type === "member_review") {
            const idx = currentStepDef.index ?? 0;
            const m = members[idx];
            if (!m?.name.trim()) errs[`member.${idx}.name`] = "El nombre es requerido.";
            if (!m?.paternal_surname.trim()) errs[`member.${idx}.paternal`] = "El apellido paterno es requerido.";
            if (!m?.relationship) errs[`member.${idx}.relationship`] = "El parentesco es requerido.";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (!validateCurrentStep()) {
            scrollViewRef.current?.scrollTo?.({ y: 0, animated: true }) ||
                scrollViewRef.current?.scrollToPosition?.(0, 0, true);
            return;
        }

        if (step < totalSteps) {
            setStep((s) => s + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep((s) => s - 1);
        }
    };

    
    const storeMutation = useFamilyProfileStore();

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload: any = {
                family_name: family.name,
                status: "new",
                current_address: [land.colony, land.city].filter(Boolean).join(", ") || "Sin dirección",
                opened_at: new Date().toISOString().split("T")[0],
            };

            await storeMutation.mutateAsync({ data: payload });
            queryClient.invalidateQueries({ queryKey: ["/family-profiles"] });
            setIsSubmitted(true);
        } catch (err: any) {
            Alert.alert(
                "Error al Guardar",
                err?.response?.data?.message || "Ocurrió un error al procesar el perfil familiar."
            );
        } finally {
            setIsLoading(false);
        }
    };

    
    const landMapPoint = land.lat && land.lng ? {
        type: "land" as const,
        title: "Terreno",
        address: land.address || undefined,
        latitude: land.lat,
        longitude: land.lng,
    } : null;

    const homeMapPoint = home.lat && home.lng ? {
        type: "home" as const,
        title: "Casa Actual",
        address: home.address || undefined,
        latitude: home.lat,
        longitude: home.lng,
    } : null;

    
    if (isSubmitted) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center p-6 gap-6">
                <View className="bg-white p-8 rounded-3xl items-center gap-6 shadow-md shadow-black/5 w-full max-w-sm">
                    <View className="h-28 w-28 rounded-3xl bg-primary/10 items-center justify-center">
                        <FluentEmoji emoji="🎉" className="text-6xl" />
                    </View>
                    <View className="gap-2 items-center">
                        <Text className="text-3xl font-black text-gray-800 text-center leading-tight">
                            ¡Familia Registrada!
                        </Text>
                        <Text className="text-gray-500 text-center text-base font-medium">
                            La información familiar ha sido registrada y guardada exitosamente en el sistema.
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.replace("/(tabs)/families")}
                        activeOpacity={0.9}
                        className="w-full bg-primary py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary/30 mt-2"
                        accessibilityRole="button"
                        accessibilityLabel="Volver a Familias"
                    >
                        <Text className="text-white font-bold text-lg">
                            Volver a Familias
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            {}
            <View className="bg-white px-6 pt-4 pb-3.5 border-b border-gray-100 shadow-md shadow-black/5 gap-2.5 z-10">
                <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-row items-center gap-3 flex-1 shrink mr-2">
                        <FluentEmoji emoji={getStepEmoji()} className="text-3xl shrink-0" />
                        <View className="flex-1 shrink">
                            <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                                Paso {step} de {totalSteps}
                            </Text>
                            <Text
                                className="text-xl font-bold text-gray-800 leading-tight"
                                numberOfLines={2}
                            >
                                {getStepTitle()}
                            </Text>
                        </View>
                    </View>
                    <Badge className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full shrink-0">
                        <Text className="text-primary font-bold text-xs">
                            {Math.round((step / totalSteps) * 100)}%
                        </Text>
                    </Badge>
                </View>

                {}
                <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </View>
            </View>

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
                                Por favor completa los campos marcados con asterisco rojo (*) para continuar.
                            </Text>
                        </View>
                    </View>
                )}

                {}
                {currentStepDef.type === "family" && (
                    <View className="gap-6">
                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🏠"
                                title="Familia"
                                description="Personas que vivirán en la casa."
                            />

                            <View className="gap-2">
                                <Input
                                    label="Apellidos del hijo menor"
                                    placeholder="Ej. Pérez López"
                                    required
                                    value={family.name}
                                    onChangeText={(val) => setFamily((p) => ({ ...p, name: val }))}
                                    error={errors["family.name"]}
                                />
                                <Text className="text-gray-400 text-sm font-medium ml-1">
                                    Ejemplo: Hernández Pérez
                                </Text>
                            </View>

                            <NumberStepper
                                label="¿Cuántas personas van a vivir en la casa?"
                                description="Incluyendo a todos los integrantes."
                                value={family.member_count}
                                onChange={handleMemberCountChange}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🏡"
                                title="Casa y Estado Civil"
                                description="Situación actual de la familia."
                            />

                            <YesNoToggle
                                label="¿Ya viven en el terreno donde se construirá?"
                                yesLabel="Sí, viven en el terreno"
                                noLabel="No, viven en otro lugar"
                                required
                                value={family.lives_on_land}
                                onChange={(val) => setFamily((p) => ({ ...p, lives_on_land: val }))}
                                error={errors["family.lives_on_land"]}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🏥"
                                title="Salud y Bienestar"
                                description="Información confidencial de apoyo a la familia."
                            />

                            <YesNoToggle
                                label="¿Algún integrante tiene problemas de adicción?"
                                yesLabel="Sí"
                                noLabel="No"
                                yesColor="amber"
                                noColor="primary"
                                optional
                                value={family.has_addictions}
                                onChange={(val) => setFamily((p) => ({ ...p, has_addictions: val }))}
                                error={errors["family.has_addictions"]}
                            />

                            {family.has_addictions && (
                                <Textarea
                                    label="Detalles de la situación"
                                    placeholder="Describe brevemente de forma confidencial..."
                                    value={family.addictions_details}
                                    onChangeText={(val) => setFamily((p) => ({ ...p, addictions_details: val }))}
                                    error={errors["family.addictions_details"]}
                                />
                            )}
                        </View>
                    </View>
                )}

                {}
                {currentStepDef.type === "land" && (
                    <View className="gap-6">
                        {}
                        <View className="bg-white p-6 rounded-3xl gap-4 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🗺️"
                                title="Ubicación en el Mapa"
                                action={
                                    <TouchableOpacity
                                        onPress={() => setMapPickerTarget("land")}
                                        className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-70"
                                        accessibilityRole="button"
                                        accessibilityLabel="Abrir mapa interactivo"
                                    >
                                        <Boxicon name="bxs-location" size={16} color="#61b346" />
                                        <Text className="text-primary font-bold text-sm">
                                            {landMapPoint ? "Reubicar" : "Ubicar"}
                                        </Text>
                                    </TouchableOpacity>
                                }
                            />

                            {landMapPoint ? (
                                <View className="gap-3">
                                    <LocationMapPreview activePoint={landMapPoint} />
                                    <TouchableOpacity
                                        onPress={() => setMapPickerTarget("land")}
                                        activeOpacity={0.85}
                                        className="bg-gray-50 border border-gray-200 py-3.5 px-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-gray-100"
                                    >
                                        <Boxicon name="bx-edit" size={20} color="#61b346" />
                                        <Text className="text-gray-800 font-bold text-base">
                                            Cambiar ubicación en el mapa
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setMapPickerTarget("land")}
                                    activeOpacity={0.85}
                                    className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex-row items-center gap-4 active:bg-gray-100"
                                    accessibilityRole="button"
                                    accessibilityLabel="Seleccionar ubicación en mapa"
                                >
                                    <View className="h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center shrink-0">
                                        <Boxicon name="bxs-location" size={32} color="#61b346" />
                                    </View>
                                    <View className="flex-1 gap-0.5">
                                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                            Ubicación
                                        </Text>
                                        <Text className="font-bold text-gray-800 text-lg leading-tight">
                                            Seleccionar en el mapa
                                        </Text>
                                        <Text className="text-primary font-bold text-sm mt-0.5">
                                            Toca para abrir el mapa
                                        </Text>
                                    </View>
                                    <Boxicon name="bx-chevron-right" size={28} color="#d1d5db" />
                                </TouchableOpacity>
                            )}

                            {errors["land.lat"] && (
                                <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-2xl mt-0.5">
                                    <FluentEmoji emoji="⚠️" className="text-lg" />
                                    <Text className="text-red-700 font-bold text-sm flex-1">
                                        {errors["land.lat"]}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="📍"
                                title="Dirección del Terreno"
                                description="¿Dónde está ubicado el terreno?"
                            />

                            <Select
                                label="Ciudad"
                                options={toOptions(CITY)}
                                required
                                value={land.city}
                                onValueChange={(val) => setLand((p) => ({ ...p, city: val }))}
                                error={errors["land.city"]}
                            />

                            <Input
                                label="Colonia"
                                placeholder="Ej. El Florido"
                                required
                                value={land.colony}
                                onChangeText={(val) => setLand((p) => ({ ...p, colony: val }))}
                                error={errors["land.colony"]}
                            />

                            <Textarea
                                label="Dirección o Referencias"
                                placeholder="Calle, número o señas particulares..."
                                value={land.address}
                                onChangeText={(val) => setLand((p) => ({ ...p, address: val }))}
                                error={errors["land.address"]}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="💰"
                                title="Pagos del Terreno"
                                description="Información de compra del terreno."
                                badge="Opcional"
                            />

                            <Input
                                label="Tiempo con el terreno"
                                placeholder="Ej. 2 años"
                                optional
                                value={land.ownership_time}
                                onChangeText={(val) => setLand((p) => ({ ...p, ownership_time: val }))}
                            />

                            <Select
                                label="Moneda"
                                options={toOptions(CURRENCY)}
                                optional
                                value={land.currency}
                                onValueChange={(val) => setLand((p) => ({ ...p, currency: val }))}
                            />

                            <Input
                                label="Costo total"
                                placeholder="0"
                                prefix="$"
                                keyboardType="numeric"
                                optional
                                value={land.total_cost}
                                onChangeText={(val) => setLand((p) => ({ ...p, total_cost: val }))}
                            />

                            <Input
                                label="Enganche"
                                placeholder="0"
                                prefix="$"
                                keyboardType="numeric"
                                optional
                                value={land.down_payment}
                                onChangeText={(val) => setLand((p) => ({ ...p, down_payment: val }))}
                            />

                            <Input
                                label="Pago mensual"
                                placeholder="0"
                                prefix="$"
                                keyboardType="numeric"
                                optional
                                value={land.monthly_payment}
                                onChangeText={(val) => setLand((p) => ({ ...p, monthly_payment: val }))}
                            />

                            <DatePickerInput
                                label="Fecha del último pago"
                                optional
                                value={land.last_payment_date}
                                onChange={(val) => setLand((p) => ({ ...p, last_payment_date: val }))}
                            />

                            <YesNoToggle
                                label="¿Cómo van los pagos?"
                                yesLabel="Al corriente"
                                noLabel="Con retraso"
                                yesColor="primary"
                                noColor="amber"
                                optional
                                value={land.is_up_to_date}
                                onChange={(val) => setLand((p) => ({ ...p, is_up_to_date: val }))}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="⚡"
                                title="Servicios del Terreno"
                            />

                            <YesNoToggle
                                label="¿El terreno es plano?"
                                yesLabel="Sí, plano"
                                noLabel="Tiene desnivel"
                                value={land.is_flat}
                                onChange={(val) => setLand((p) => ({ ...p, is_flat: val }))}
                            />

                            <View className="gap-2.5">
                                <Text className="text-base font-bold text-gray-700">
                                    Servicios disponibles
                                </Text>
                                <View className="flex-row flex-wrap gap-2.5">
                                    {toOptions(LAND_SERVICES).map((svc) => {
                                        const isSelected = land.services.includes(svc.value);
                                        return (
                                            <TouchableOpacity
                                                key={svc.value}
                                                onPress={() => toggleLandService(svc.value)}
                                                activeOpacity={0.85}
                                                className={`px-4 py-3.5 rounded-2xl border ${
                                                    isSelected
                                                        ? "border-primary bg-primary/10"
                                                        : "border-gray-200 bg-gray-50 active:bg-gray-100"
                                                }`}
                                            >
                                                <View className="flex-row items-center gap-2">
                                                    {svc.emoji && <FluentEmoji emoji={svc.emoji} className="text-lg" />}
                                                    <Text
                                                        className={`font-bold text-base ${
                                                            isSelected ? "text-primary font-black" : "text-gray-700"
                                                        }`}
                                                    >
                                                        {svc.label}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {}
                {currentStepDef.type === "home" && (
                    <View className="gap-6">
                        {}
                        <View className="bg-white p-6 rounded-3xl gap-4 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🗺️"
                                title="Ubicación en el Mapa"
                                action={
                                    <TouchableOpacity
                                        onPress={() => setMapPickerTarget("home")}
                                        className="bg-amber-100 px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-70"
                                        accessibilityRole="button"
                                        accessibilityLabel="Abrir mapa interactivo"
                                    >
                                        <Boxicon name="bxs-location" size={16} color="#d97706" />
                                        <Text className="text-amber-800 font-bold text-sm">
                                            {homeMapPoint ? "Reubicar" : "Ubicar"}
                                        </Text>
                                    </TouchableOpacity>
                                }
                            />

                            {homeMapPoint ? (
                                <View className="gap-3">
                                    <LocationMapPreview activePoint={homeMapPoint} />
                                    <TouchableOpacity
                                        onPress={() => setMapPickerTarget("home")}
                                        activeOpacity={0.85}
                                        className="bg-gray-50 border border-gray-200 py-3.5 px-4 rounded-2xl flex-row items-center justify-center gap-2 active:bg-gray-100"
                                    >
                                        <Boxicon name="bx-edit" size={20} color="#d97706" />
                                        <Text className="text-gray-800 font-bold text-base">
                                            Cambiar ubicación en el mapa
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setMapPickerTarget("home")}
                                    activeOpacity={0.85}
                                    className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex-row items-center gap-4 active:bg-gray-100"
                                    accessibilityRole="button"
                                    accessibilityLabel="Seleccionar ubicación en mapa"
                                >
                                    <View className="h-16 w-16 rounded-2xl bg-amber-100 items-center justify-center shrink-0">
                                        <Boxicon name="bxs-location" size={32} color="#d97706" />
                                    </View>
                                    <View className="flex-1 gap-0.5">
                                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                            Ubicación
                                        </Text>
                                        <Text className="font-bold text-gray-800 text-lg leading-tight">
                                            Seleccionar en el mapa
                                        </Text>
                                        <Text className="text-amber-700 font-bold text-sm mt-0.5">
                                            Toca para abrir el mapa
                                        </Text>
                                    </View>
                                    <Boxicon name="bx-chevron-right" size={28} color="#d1d5db" />
                                </TouchableOpacity>
                            )}

                            {errors["home.lat"] && (
                                <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-2xl mt-0.5">
                                    <FluentEmoji emoji="⚠️" className="text-lg" />
                                    <Text className="text-red-700 font-bold text-sm flex-1">
                                        {errors["home.lat"]}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="📍"
                                title="Dirección Actual"
                                description="¿Dónde vive la familia actualmente?"
                            />

                            <Select
                                label="Ciudad"
                                options={toOptions(CITY)}
                                required
                                value={home.city}
                                onValueChange={(val) => setHome((p) => ({ ...p, city: val }))}
                                error={errors["home.city"]}
                            />

                            <Input
                                label="Colonia"
                                placeholder="Ej. Mariano Matamoros"
                                required
                                value={home.colony}
                                onChangeText={(val) => setHome((p) => ({ ...p, colony: val }))}
                                error={errors["home.colony"]}
                            />

                            <Textarea
                                label="Dirección o Referencias"
                                placeholder="Calle, número o señas particulares..."
                                value={home.address}
                                onChangeText={(val) => setHome((p) => ({ ...p, address: val }))}
                                error={errors["home.address"]}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🔑"
                                title="Renta y Vivienda"
                                description="Información de la vivienda actual."
                                badge="Opcional"
                            />

                            <Select
                                label="Tipo de vivienda"
                                options={toOptions(HOUSING_STATUS)}
                                optional
                                value={home.status}
                                onValueChange={(val) => setHome((p) => ({ ...p, status: val }))}
                            />

                            <Input
                                label="Tiempo viviendo aquí"
                                placeholder="Ej. 2 años"
                                value={home.ownership_time}
                                onChangeText={(val) => setHome((p) => ({ ...p, ownership_time: val }))}
                            />

                            <Input
                                label="Dueño de la casa"
                                placeholder="Nombre del dueño o arrendador"
                                value={home.owner_name}
                                onChangeText={(val) => setHome((p) => ({ ...p, owner_name: val }))}
                            />

                            {home.status === "rented" && (
                                <>
                                    <Select
                                        label="Moneda"
                                        options={toOptions(CURRENCY)}
                                        value={home.monthly_rent_currency}
                                        onValueChange={(val) => setHome((p) => ({ ...p, monthly_rent_currency: val }))}
                                    />
                                    <Input
                                        label="Renta mensual"
                                        placeholder="0"
                                        prefix="$"
                                        keyboardType="numeric"
                                        value={home.monthly_rent}
                                        onChangeText={(val) => setHome((p) => ({ ...p, monthly_rent: val }))}
                                    />
                                    <YesNoToggle
                                        label="¿Tiene recibos de renta?"
                                        yesLabel="Sí tiene"
                                        noLabel="No tiene"
                                        value={home.has_receipts}
                                        onChange={(val) => setHome((p) => ({ ...p, has_receipts: val }))}
                                    />
                                </>
                            )}
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="📝"
                                title="Descripción de la Casa"
                            />

                            <Textarea
                                label="¿Cómo es la casa actual?"
                                placeholder="Materiales de techo, paredes, piso..."
                                value={home.description}
                                onChangeText={(val) => setHome((p) => ({ ...p, description: val }))}
                            />
                        </View>
                    </View>
                )}

                {}
                {currentStepDef.type === "member_upload" && currentStepDef.index !== undefined && (
                    <View className="gap-6">
                        <View className="bg-white p-6 rounded-3xl gap-2 shadow-md shadow-black/5">
                            <View className="flex-row items-center gap-3">
                                <FluentEmoji emoji="📇" className="text-4xl" />
                                <View className="flex-1">
                                    <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                                        {currentStepDef.index === 0 ? "Aplicante Principal" : `Integrante ${currentStepDef.index + 1}`}
                                    </Text>
                                    <Text className="font-bold text-gray-800 text-2xl leading-tight">
                                        {currentStepDef.index === 0
                                            ? "Documentos del Aplicante"
                                            : `Documentos de Familiar ${currentStepDef.index + 1}`}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <DocumentUploadCard
                            emoji="🪪"
                            title="Identificación Oficial (INE)"
                            description="INE para adultos o Acta de Nacimiento para menores de edad."
                            badge="optional"
                            icon="bxs-user-id-card"
                            buttonText="Subir INE (Adulto)"
                            secondaryButtonText="Subir Acta de Nacimiento (Menor)"
                            value={members[currentStepDef.index]?.identification || members[currentStepDef.index]?.birth_certificate}
                            onChange={(file) => updateMemberField(currentStepDef.index!, "identification", file)}
                            onSecondaryUpload={(file) => updateMemberField(currentStepDef.index!, "birth_certificate", file)}
                        />

                        <DocumentUploadCard
                            emoji="💵"
                            title="Comprobante de Ingresos"
                            description="Recibo de nómina o comprobante si aporta dinero al hogar."
                            badge="optional"
                            icon="bxs-wallet"
                            buttonText="Subir comprobante de ingresos"
                            value={members[currentStepDef.index]?.income_proof}
                            onChange={(file) => updateMemberField(currentStepDef.index!, "income_proof", file)}
                        />
                    </View>
                )}

                {}
                {currentStepDef.type === "member_review" && currentStepDef.index !== undefined && (
                    <View className="gap-6">
                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="👤"
                                title="Datos Personales"
                                description="Nombre completo y parentesco."
                            />

                            <Input
                                label="Nombre(s)"
                                placeholder="Ej. María Guadalupe"
                                required
                                value={members[currentStepDef.index]?.name}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "name", val)}
                                error={errors[`member.${currentStepDef.index}.name`]}
                            />

                            <Input
                                label="Apellido Paterno"
                                placeholder="Ej. Hernández"
                                required
                                value={members[currentStepDef.index]?.paternal_surname}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "paternal_surname", val)}
                                error={errors[`member.${currentStepDef.index}.paternal`]}
                            />

                            <Input
                                label="Apellido Materno"
                                placeholder="Ej. Pérez"
                                optional
                                value={members[currentStepDef.index]?.maternal_surname}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "maternal_surname", val)}
                                error={errors[`member.${currentStepDef.index}.maternal`]}
                            />

                            <Select
                                label="Parentesco"
                                options={toOptions(RELATIONSHIP)}
                                required
                                value={members[currentStepDef.index]?.relationship}
                                onValueChange={(val) => updateMemberField(currentStepDef.index!, "relationship", val)}
                                error={errors[`member.${currentStepDef.index}.relationship`]}
                            />

                            <Select
                                label="Estado Civil"
                                options={toOptions(MARITAL_STATUS)}
                                optional
                                value={members[currentStepDef.index]?.marital_status}
                                onValueChange={(val) => updateMemberField(currentStepDef.index!, "marital_status", val)}
                            />

                            <DatePickerInput
                                label="Fecha de Nacimiento"
                                required
                                value={members[currentStepDef.index]?.birth_date}
                                onChange={(val) => updateMemberField(currentStepDef.index!, "birth_date", val)}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="📱"
                                title="Contacto y CURP"
                                description="Teléfono y CURP del integrante."
                            />

                            <Input
                                label="Teléfono"
                                placeholder="Ej. 664 123 4567"
                                keyboardType="phone-pad"
                                optional
                                value={members[currentStepDef.index]?.phone}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "phone", val)}
                            />

                            <Input
                                label="CURP"
                                placeholder="18 caracteres alfanuméricos"
                                autoCapitalize="characters"
                                autoCorrect={false}
                                maxLength={18}
                                optional
                                value={members[currentStepDef.index]?.curp}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "curp", val)}
                                error={errors[`member.${currentStepDef.index}.curp`]}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="💼"
                                title="Trabajo y Estudios"
                                description="Ocupación y grado escolar."
                            />

                            <Select
                                label="Ocupación"
                                options={toOptions(OCCUPATION)}
                                optional
                                value={members[currentStepDef.index]?.occupation}
                                onValueChange={(val) => updateMemberField(currentStepDef.index!, "occupation", val)}
                            />

                            <Input
                                label="Ingreso semanal"
                                placeholder="0"
                                prefix="$"
                                keyboardType="numeric"
                                optional
                                value={members[currentStepDef.index]?.weekly_income}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "weekly_income", val)}
                            />

                            <Select
                                label="Escolaridad"
                                options={toOptions(EDUCATION_LEVEL)}
                                optional
                                value={members[currentStepDef.index]?.education_level}
                                onValueChange={(val) => updateMemberField(currentStepDef.index!, "education_level", val)}
                            />

                            <Input
                                label="Último grado cursado"
                                placeholder="Ej. 3"
                                keyboardType="numeric"
                                optional
                                value={members[currentStepDef.index]?.education_grade}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "education_grade", val)}
                            />
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🌍"
                                title="Lugar de Origen"
                                description="Origen y lengua materna."
                            />

                            <Select
                                label="Religión"
                                options={toOptions(RELIGION)}
                                optional
                                value={members[currentStepDef.index]?.religion}
                                onValueChange={(val) => updateMemberField(currentStepDef.index!, "religion", val)}
                            />

                            <Input
                                label="País de origen"
                                placeholder="Ej. México"
                                optional
                                value={members[currentStepDef.index]?.origin_country}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "origin_country", val)}
                            />

                            <Input
                                label="Estado de origen"
                                placeholder="Ej. Baja California"
                                optional
                                value={members[currentStepDef.index]?.origin_state}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "origin_state", val)}
                            />

                            <YesNoToggle
                                label="¿Habla alguna lengua indígena?"
                                yesLabel="Sí"
                                noLabel="No"
                                optional
                                value={members[currentStepDef.index]?.speaks_indigenous_language}
                                onChange={(val) => updateMemberField(currentStepDef.index!, "speaks_indigenous_language", val)}
                            />

                            {members[currentStepDef.index]?.speaks_indigenous_language && (
                                <Select
                                    label="¿Cuál lengua indígena?"
                                    options={toOptions(INDIGENOUS_LANGUAGE)}
                                    value={members[currentStepDef.index]?.indigenous_language}
                                    onValueChange={(val) => updateMemberField(currentStepDef.index!, "indigenous_language", val)}
                                />
                            )}
                        </View>

                        {}
                        <View className="bg-white p-6 rounded-3xl gap-5 shadow-md shadow-black/5">
                            <SectionHeader
                                emoji="🏥"
                                title="Salud y Terreno"
                            />

                            {members[currentStepDef.index]?.relationship !== "padre" && (
                                <>
                                    <YesNoToggle
                                        label="¿Está embarazada?"
                                        yesLabel="Sí"
                                        noLabel="No"
                                        yesColor="amber"
                                        noColor="primary"
                                        value={members[currentStepDef.index]?.is_pregnant}
                                        onChange={(val) => updateMemberField(currentStepDef.index!, "is_pregnant", val)}
                                    />

                                    {members[currentStepDef.index]?.is_pregnant && (
                                        <Input
                                            label="Meses de embarazo"
                                            placeholder="1 a 9"
                                            keyboardType="numeric"
                                            value={members[currentStepDef.index]?.pregnancy_months}
                                            onChangeText={(val) => updateMemberField(currentStepDef.index!, "pregnancy_months", val)}
                                        />
                                    )}
                                </>
                            )}

                            <Input
                                label="Condición médica o discapacidad"
                                placeholder="Ej. diabetes, silla de ruedas..."
                                value={members[currentStepDef.index]?.medical_notes}
                                onChangeText={(val) => updateMemberField(currentStepDef.index!, "medical_notes", val)}
                            />

                            <YesNoToggle
                                label="¿Es dueño(a) del terreno?"
                                description="Marca sí si es el titular o dueño registrado del terreno."
                                yesLabel="Sí, es dueño(a)"
                                noLabel="No"
                                value={members[currentStepDef.index]?.is_land_owner}
                                onChange={(val) => updateMemberField(currentStepDef.index!, "is_land_owner", val)}
                            />
                        </View>
                    </View>
                )}

                {}
                {currentStepDef.type === "general_docs" && (
                    <View className="gap-6">
                        <View className="bg-white p-6 rounded-3xl gap-2 shadow-md shadow-black/5">
                            <View className="flex-row items-center gap-3">
                                <FluentEmoji emoji="📸" className="text-4xl" />
                                <View className="flex-1">
                                    <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                                        Paso Final
                                    </Text>
                                    <Text className="font-bold text-gray-800 text-2xl leading-tight">
                                        Fotos y Documentos
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <DocumentUploadCard
                            emoji="🏠"
                            title="1. Foto de la Familia"
                            description="Foto donde aparezcan todos los que vivirán en la casa."
                            badge="optional"
                            icon="bxs-camera"
                            buttonText="Tomar o seleccionar foto"
                            value={docs.family_photo}
                            onChange={(file) => setDocs((p) => ({ ...p, family_photo: file }))}
                        />

                        <DocumentUploadCard
                            emoji="📜"
                            title="2. Documento del Terreno"
                            description="Foto o archivo PDF del título o contrato de propiedad."
                            badge="optional"
                            icon="bxs-file"
                            buttonText="Subir contrato o título"
                            value={docs.land_ownership}
                            onChange={(file) => setDocs((p) => ({ ...p, land_ownership: file }))}
                        />

                        <View className="bg-white p-6 rounded-3xl shadow-md shadow-black/5 gap-4">
                            <SectionHeader
                                emoji="🧾"
                                title="3. Recibos del Terreno"
                                action={
                                    <Badge className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full">
                                        <Text className="text-primary font-bold text-xs">
                                            {docs.land_receipts.length}/5
                                        </Text>
                                    </Badge>
                                }
                            />
                            <Text className="text-gray-500 text-base font-medium -mt-2">
                                Comprobantes de pago del terreno (hasta 5 recibos).
                            </Text>

                            {docs.land_receipts.map((receipt, idx) => (
                                <View
                                    key={idx}
                                    className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center gap-3.5 flex-1 mr-2">
                                        <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center shrink-0">
                                            <Boxicon name="bxs-file" size={24} color="#61b346" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-800 font-bold text-base" numberOfLines={1}>
                                                Recibo {idx + 1}
                                            </Text>
                                            <Text className="text-gray-500 text-xs font-medium">
                                                Documento adjunto
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setDocs((p) => ({
                                                ...p,
                                                land_receipts: p.land_receipts.filter((_, i) => i !== idx),
                                            }))
                                        }
                                        activeOpacity={0.7}
                                        className="h-11 w-11 bg-red-50 rounded-xl items-center justify-center active:bg-red-100"
                                        accessibilityRole="button"
                                        accessibilityLabel={`Eliminar recibo ${idx + 1}`}
                                    >
                                        <Boxicon name="bxs-trash" size={18} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {docs.land_receipts.length < 5 && (
                                <DocumentUploadCard
                                    title="Añadir Recibo"
                                    description="Sube otro recibo de pago del terreno"
                                    badge="optional"
                                    icon="bxs-plus-circle"
                                    buttonText="Subir otro recibo"
                                    className="gap-3 pt-2"
                                    onChange={(file) => {
                                        if (file) {
                                            const newReceipt: UploadedFileAsset | string = file;
                                            setDocs((p) => ({
                                                ...p,
                                                land_receipts: [...p.land_receipts, newReceipt],
                                            }));
                                        }
                                    }}
                                />
                            )}
                        </View>
                    </View>
                )}
            </KeyboardAwareScrollView>

            {}
            <View
                style={{ paddingBottom: Math.max(bottom, 16) }}
                className="bg-white border-t border-gray-100 px-6 pt-4 flex-row items-center gap-3.5 shadow-xl shadow-black/10 z-10"
            >
                {step > 1 && (
                    <TouchableOpacity
                        onPress={handlePrev}
                        activeOpacity={0.8}
                        className="h-14 px-5 rounded-2xl bg-gray-100 flex-row items-center justify-center gap-1.5 active:bg-gray-200"
                        accessibilityRole="button"
                        accessibilityLabel="Paso anterior"
                    >
                        <Boxicon name="bx-chevron-left" size={24} color="#374151" />
                        <Text className="font-bold text-gray-700 text-base">Atrás</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleNext}
                    disabled={isLoading}
                    activeOpacity={0.85}
                    className={`flex-1 h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg ${
                        step === totalSteps
                            ? "bg-primary shadow-primary/30 active:opacity-90"
                            : "bg-primary shadow-primary/25 active:opacity-90"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel={step === totalSteps ? "Registrar Familia" : "Siguiente paso"}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <>
                            <Text className="text-white font-black text-lg">
                                {step === totalSteps ? "Registrar Familia" : "Siguiente"}
                            </Text>
                            <Boxicon
                                name={step === totalSteps ? "bxs-check-circle" : "bx-chevron-right"}
                                size={22}
                                color="#ffffff"
                            />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {}
            {mapPickerTarget && (
                <LocationPickerModal
                    visible={!!mapPickerTarget}
                    title={mapPickerTarget === "land" ? "Ubicación del Terreno" : "Ubicación de Casa Actual"}
                    onClose={() => setMapPickerTarget(null)}
                    onConfirm={handleLocationConfirm}
                    initialLatitude={
                        mapPickerTarget === "land"
                            ? land.lat ?? undefined
                            : home.lat ?? undefined
                    }
                    initialLongitude={
                        mapPickerTarget === "land"
                            ? land.lng ?? undefined
                            : home.lng ?? undefined
                    }
                    initialAddress={
                        mapPickerTarget === "land"
                            ? land.address || land.colony
                            : home.address || home.colony
                    }
                />
            )}
        </View>
    );
}
