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
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import SectionHeader from "@/components/SectionHeader";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import DatePickerInput from "@/components/DatePickerInput";
import YesNoToggle from "@/components/YesNoToggle";
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
    LAND_SERVICES,
    HOUSING_STATUS,
    CURRENCY,
    CITY,
    FAMILY_STATUS,
    LAND_SIZE,
    toOptions,
} from "@/lib/enums";
import { FamilyProfileResource, FamilyStatus } from "@/services/generated/apiTypes";
import {
    useFamilyProfileUpdate,
    useFamilyProfileShow,
    getFamilyProfileShowQueryKey,
} from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";

export default function EditFamilyProfilePage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { bottom } = useSafeAreaInsets();
    const scrollViewRef = useRef<any>(null);

    const familyProfileId = Number(id);
    const queryClient = useQueryClient();

    const { data: profileData, isPending: isDataLoading } = useFamilyProfileShow(
        familyProfileId,
        { query: { enabled: !isNaN(familyProfileId) && familyProfileId > 0 } }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    
    const [openSections, setOpenSections] = useState({
        status: true,
        construction: true,
        family: true,
        land: true,
        home: true,
        docs: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((p) => ({ ...p, [section]: !p[section] }));
    };

    
    const [mapPickerTarget, setMapPickerTarget] = useState<"land" | "home" | null>(null);

    
    const [statusState, setStatusState] = useState({
        status: "new" as FamilyStatus,
        reason: "",
        interviewer_name: "",
        opened_at: "",
    });

    const [construction, setConstruction] = useState({
        building_start_date: "",
        building_team: "",
        building_team_color: "",
        construction_notified: false as boolean | null,
    });

    const [family, setFamily] = useState({
        name: "",
        lives_on_land: true as boolean | null,
        has_addictions: false as boolean | null,
        addictions_details: "",
        general_observations: "",
    });

    const [land, setLand] = useState({
        city: "Tijuana",
        colony: "",
        address: "",
        lat: null as number | null,
        lng: null as number | null,
        ownership_time: "",
        land_size: "" as string,
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

    const [docs, setDocs] = useState({
        family_photo: null as UploadedFileAsset | string | null,
        land_ownership: null as UploadedFileAsset | string | null,
        land_receipts: [] as (UploadedFileAsset | string)[],
    });

    
    const initialSnapshotRef = useRef<string>("");

    
    useEffect(() => {
        if (!profileData) return;
        const initialData = profileData as FamilyProfileResource;

        const initialStatus = {
            status: (initialData.status as FamilyStatus) || "new",
            reason: initialData.reason || "",
            interviewer_name: initialData.interviewer_name || "",
            opened_at: initialData.opened_at ? String(initialData.opened_at).split("T")[0] : "",
        };

        const initialConstruction = {
            building_start_date: initialData.building_start_date ? String(initialData.building_start_date).split("T")[0] : "",
            building_team: initialData.building_team || "",
            building_team_color: initialData.building_team_color || "",
            construction_notified: initialData.construction_notified ?? false,
        };

        const initialFamily = {
            name: initialData.family_name || "",
            lives_on_land: initialData.lives_on_land ?? true,
            has_addictions: initialData.has_addictions ?? false,
            addictions_details: initialData.addictions_details || "",
            general_observations: initialData.general_observations || "",
        };

        const initialLand = {
            city: initialData.land_city || "Tijuana",
            colony: initialData.land_colony || "",
            address: initialData.land_address || "",
            lat: initialData.land_latitude ? Number(initialData.land_latitude) : null,
            lng: initialData.land_longitude ? Number(initialData.land_longitude) : null,
            ownership_time: initialData.land_ownership_time || "",
            land_size: (initialData.land_size as unknown as string) || "",
            is_flat: initialData.land_is_flat ?? true,
            currency: (initialData as any).land_currency || "mxn",
            total_cost: initialData.land_total_cost ? String(initialData.land_total_cost) : "",
            down_payment: initialData.land_down_payment ? String(initialData.land_down_payment) : "",
            monthly_payment: initialData.land_monthly_payment ? String(initialData.land_monthly_payment) : "",
            last_payment_date: initialData.land_last_payment_date ? String(initialData.land_last_payment_date).split("T")[0] : "",
            is_up_to_date: initialData.land_is_up_to_date ?? true,
            services: (initialData.land_services as string[]) || ["electricity", "water"],
        };

        const initialHome = {
            city: initialData.home_city || "Tijuana",
            colony: initialData.home_colony || "",
            address: initialData.home_address || "",
            lat: initialData.home_latitude ? Number(initialData.home_latitude) : null,
            lng: initialData.home_longitude ? Number(initialData.home_longitude) : null,
            status: initialData.home_status || "rented",
            ownership_time: initialData.home_ownership_time || "",
            owner_name: initialData.home_owner_name || "",
            monthly_rent: initialData.home_monthly_rent ? String(initialData.home_monthly_rent) : "",
            monthly_rent_currency: initialData.home_monthly_rent_currency || "mxn",
            has_receipts: initialData.home_has_receipts ?? false,
            description: initialData.house_description || "",
        };

        const initialDocs = {
            family_photo: initialData.family_photo_path || null,
            land_ownership: null,
            land_receipts: [],
        };

        setStatusState(initialStatus);
        setConstruction(initialConstruction);
        setFamily(initialFamily);
        setLand(initialLand);
        setHome(initialHome);
        setDocs(initialDocs);

        initialSnapshotRef.current = JSON.stringify({
            statusState: initialStatus,
            construction: initialConstruction,
            family: initialFamily,
            land: initialLand,
            home: initialHome,
            docs: initialDocs,
        });
    }, [profileData]);

    
    const isDirty = useMemo(() => {
        if (!initialSnapshotRef.current) return false;
        const currentSnapshot = JSON.stringify({
            statusState,
            construction,
            family,
            land,
            home,
            docs,
        });
        return currentSnapshot !== initialSnapshotRef.current;
    }, [statusState, construction, family, land, home, docs]);

    
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

    
    const validateForm = (): boolean => {
        const errs: Record<string, string> = {};

        if (!family.name.trim()) errs["family.name"] = "El apellido o nombre familiar es requerido.";
        if (family.lives_on_land === null) errs["family.lives_on_land"] = "Selecciona si viven en el terreno.";
        if (!land.city) errs["land.city"] = "La ciudad del terreno es requerida.";
        if (!land.colony.trim()) errs["land.colony"] = "La colonia del terreno es requerida.";

        if (!family.lives_on_land) {
            if (!home.city) errs["home.city"] = "La ciudad de la casa actual es requerida.";
            if (!home.colony.trim()) errs["home.colony"] = "La colonia de la casa actual es requerida.";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    
    const updateMutation = useFamilyProfileUpdate();

    const handleSubmit = async () => {
        if (!validateForm()) {
            scrollViewRef.current?.scrollTo?.({ y: 0, animated: true }) ||
                scrollViewRef.current?.scrollToPosition?.(0, 0, true);
            return;
        }

        setIsLoading(true);
        try {
            const payload: any = {
                family_name: family.name,
                status: statusState.status,
                reason: statusState.reason || undefined,
                opened_at: statusState.opened_at || undefined,
                interviewer_name: statusState.interviewer_name || undefined,

                building_start_date: construction.building_start_date || undefined,
                building_team: construction.building_team || undefined,
                building_team_color: construction.building_team_color || undefined,
                construction_notified: construction.construction_notified,

                lives_on_land: family.lives_on_land,
                has_addictions: family.has_addictions,
                addictions_details: family.has_addictions ? family.addictions_details : undefined,
                general_observations: family.general_observations || undefined,

                land_city: land.city,
                land_colony: land.colony,
                land_address: land.address || undefined,
                land_latitude: land.lat ? String(land.lat) : undefined,
                land_longitude: land.lng ? String(land.lng) : undefined,
                land_ownership_time: land.ownership_time || undefined,
                land_size: land.land_size || undefined,
                land_is_flat: land.is_flat,
                land_currency: land.currency,
                land_total_cost: land.total_cost ? Number(land.total_cost) : undefined,
                land_down_payment: land.down_payment ? Number(land.down_payment) : undefined,
                land_monthly_payment: land.monthly_payment ? Number(land.monthly_payment) : undefined,
                land_last_payment_date: land.last_payment_date || undefined,
                land_is_up_to_date: land.is_up_to_date,
                land_services: land.services,

                home_city: family.lives_on_land ? undefined : home.city,
                home_colony: family.lives_on_land ? undefined : home.colony,
                home_address: family.lives_on_land ? undefined : home.address,
                home_latitude: family.lives_on_land || !home.lat ? undefined : String(home.lat),
                home_longitude: family.lives_on_land || !home.lng ? undefined : String(home.lng),
                home_status: family.lives_on_land ? undefined : home.status,
                home_ownership_time: family.lives_on_land ? undefined : home.ownership_time,
                home_owner_name: family.lives_on_land ? undefined : home.owner_name,
                home_monthly_rent: family.lives_on_land || !home.monthly_rent ? undefined : Number(home.monthly_rent),
                home_monthly_rent_currency: home.monthly_rent_currency,
                home_has_receipts: family.lives_on_land ? undefined : home.has_receipts,
                house_description: family.lives_on_land ? undefined : home.description,
            };

            await updateMutation.mutateAsync({ familyProfile: familyProfileId, data: payload });

            queryClient.invalidateQueries({ queryKey: getFamilyProfileShowQueryKey(familyProfileId) });
            queryClient.invalidateQueries({ queryKey: ["/family-profiles"] });

            router.replace(`/family-profile/${familyProfileId}` as any);
        } catch (err: any) {
            Alert.alert(
                "Error al Guardar",
                err?.response?.data?.message || "Ocurrió un error al actualizar el perfil familiar."
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

    if (isDataLoading && !profileData) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center">
                <ActivityIndicator size="large" color="#61b346" />
                <Text className="text-gray-500 font-bold text-base mt-3">
                    Cargando datos de la familia...
                </Text>
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
                        onPress={() => toggleSection("status")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="📋" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Estatus y Proceso
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Estatus del caso, motivo y datos de entrevista.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.status ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.status && (
                        <View className="p-6 gap-5 bg-white">
                            <Select
                                label="Estatus de la Familia"
                                options={toOptions(FAMILY_STATUS)}
                                required
                                value={statusState.status}
                                onValueChange={(val) => setStatusState((p) => ({ ...p, status: val as FamilyStatus }))}
                            />

                            {[FAMILY_STATUS.approved, FAMILY_STATUS.programmed, FAMILY_STATUS.built, FAMILY_STATUS.not_eligible, FAMILY_STATUS.dont_build].some((s) => s.value === statusState.status) && (
                                <Textarea
                                    label="Razón"
                                    placeholder="Explica brevemente la razón de este estatus..."
                                    value={statusState.reason}
                                    onChangeText={(val) => setStatusState((p) => ({ ...p, reason: val }))}
                                />
                            )}

                            <DatePickerInput
                                label="Fecha de la Entrevista"
                                optional
                                value={statusState.opened_at}
                                onChange={(val) => setStatusState((p) => ({ ...p, opened_at: val }))}
                            />

                            <Input
                                label="Entrevistado por"
                                placeholder="Nombre del entrevistador(a)"
                                value={statusState.interviewer_name}
                                onChangeText={(val) => setStatusState((p) => ({ ...p, interviewer_name: val }))}
                            />
                        </View>
                    )}
                </View>

                {}
                {[FAMILY_STATUS.approved, FAMILY_STATUS.programmed, FAMILY_STATUS.built].some((s) => s.value === statusState.status) && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                        <TouchableOpacity
                            onPress={() => toggleSection("construction")}
                            activeOpacity={0.8}
                            className="p-6 flex-row items-center justify-between border-b border-gray-100"
                        >
                            <View className="flex-row items-center gap-3 flex-1 mr-2">
                                <FluentEmoji emoji="🏗️" className="text-3xl" />
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 text-xl">
                                        Construcción
                                    </Text>
                                    <Text className="text-gray-500 text-sm font-medium">
                                        Fechas de obra, equipo constructor y notificación.
                                    </Text>
                                </View>
                            </View>
                            <Boxicon
                                name={openSections.construction ? "bx-chevron-up" : "bx-chevron-down"}
                                size={24}
                                color="#6b7280"
                            />
                        </TouchableOpacity>

                        {openSections.construction && (
                            <View className="p-6 gap-5 bg-white">
                                <DatePickerInput
                                    label="Fecha de Inicio de Construcción"
                                    optional
                                    value={construction.building_start_date}
                                    onChange={(val) => setConstruction((p) => ({ ...p, building_start_date: val }))}
                                />

                                <Input
                                    label="Equipo o Iglesia Constructora"
                                    placeholder="Ej. Calvary Chapel / Hope Builders"
                                    value={construction.building_team}
                                    onChangeText={(val) => setConstruction((p) => ({ ...p, building_team: val }))}
                                />

                                <Input
                                    label="Color del Equipo (Código Hex o Nombre)"
                                    placeholder="Ej. #61b346 o Verde"
                                    value={construction.building_team_color}
                                    onChangeText={(val) => setConstruction((p) => ({ ...p, building_team_color: val }))}
                                />

                                <YesNoToggle
                                    label="¿Familia notificada de la construcción?"
                                    yesLabel="Sí, notificada"
                                    noLabel="No notificada"
                                    value={construction.construction_notified}
                                    onChange={(val) => setConstruction((p) => ({ ...p, construction_notified: val }))}
                                />
                            </View>
                        )}
                    </View>
                )}

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("family")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="🏠" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Familia y Observaciones
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Nombre familiar, estado civil y notas.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.family ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.family && (
                        <View className="p-6 gap-5 bg-white">
                            <Input
                                label="Apellidos del hijo menor"
                                placeholder="Ej. Pérez López"
                                required
                                value={family.name}
                                onChangeText={(val) => setFamily((p) => ({ ...p, name: val }))}
                                error={errors["family.name"]}
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

                            <YesNoToggle
                                label="¿Algún integrante tiene problemas de adicción?"
                                yesLabel="Sí"
                                noLabel="No"
                                yesColor="amber"
                                noColor="primary"
                                optional
                                value={family.has_addictions}
                                onChange={(val) => setFamily((p) => ({ ...p, has_addictions: val }))}
                            />

                            {family.has_addictions && (
                                <Textarea
                                    label="Detalles de la situación"
                                    placeholder="Describe brevemente de forma confidencial..."
                                    value={family.addictions_details}
                                    onChangeText={(val) => setFamily((p) => ({ ...p, addictions_details: val }))}
                                />
                            )}

                            <Textarea
                                label="Observaciones Generales"
                                placeholder="Comentarios y notas importantes del caso familiar..."
                                value={family.general_observations}
                                onChangeText={(val) => setFamily((p) => ({ ...p, general_observations: val }))}
                            />
                        </View>
                    )}
                </View>

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("land")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="📍" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Terreno
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Ubicación, medidas, servicios y pagos.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.land ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.land && (
                        <View className="p-6 gap-5 bg-white">
                            {}
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
                                    </View>
                                    <Boxicon name="bx-chevron-right" size={28} color="#d1d5db" />
                                </TouchableOpacity>
                            )}

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
                            />

                            <Select
                                label="Medidas del Terreno"
                                options={toOptions(LAND_SIZE)}
                                optional
                                value={land.land_size}
                                onValueChange={(val) => setLand((p) => ({ ...p, land_size: val }))}
                            />

                            <Input
                                label="Tiempo con el terreno"
                                placeholder="Ej. 2 años"
                                optional
                                value={land.ownership_time}
                                onChangeText={(val) => setLand((p) => ({ ...p, ownership_time: val }))}
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

                            {}
                            <Select
                                label="Moneda de Pago"
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
                    )}
                </View>

                {}
                {!family.lives_on_land && (
                    <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                        <TouchableOpacity
                            onPress={() => toggleSection("home")}
                            activeOpacity={0.8}
                            className="p-6 flex-row items-center justify-between border-b border-gray-100"
                        >
                            <View className="flex-row items-center gap-3 flex-1 mr-2">
                                <FluentEmoji emoji="🏡" className="text-3xl" />
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 text-xl">
                                        Casa Actual
                                    </Text>
                                    <Text className="text-gray-500 text-sm font-medium">
                                        Lugar donde vive la familia hoy en día.
                                    </Text>
                                </View>
                            </View>
                            <Boxicon
                                name={openSections.home ? "bx-chevron-up" : "bx-chevron-down"}
                                size={24}
                                color="#6b7280"
                            />
                        </TouchableOpacity>

                        {openSections.home && (
                            <View className="p-6 gap-5 bg-white">
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
                                        </View>
                                        <Boxicon name="bx-chevron-right" size={28} color="#d1d5db" />
                                    </TouchableOpacity>
                                )}

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

                                <Textarea
                                    label="¿Cómo es la casa actual?"
                                    placeholder="Materiales de techo, paredes, piso..."
                                    value={home.description}
                                    onChangeText={(val) => setHome((p) => ({ ...p, description: val }))}
                                />
                            </View>
                        )}
                    </View>
                )}

                {}
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => toggleSection("docs")}
                        activeOpacity={0.8}
                        className="p-6 flex-row items-center justify-between border-b border-gray-100"
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <FluentEmoji emoji="📸" className="text-3xl" />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-xl">
                                    Fotos y Documentos
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    Foto familiar, título de terreno y recibos.
                                </Text>
                            </View>
                        </View>
                        <Boxicon
                            name={openSections.docs ? "bx-chevron-up" : "bx-chevron-down"}
                            size={24}
                            color="#6b7280"
                        />
                    </TouchableOpacity>

                    {openSections.docs && (
                        <View className="p-6 gap-6 bg-white">
                            <DocumentUploadCard
                                emoji="🏠"
                                title="1. Foto de la Familia"
                                description="Foto donde aparezcan todos los que vivirán en la casa."
                                badge="optional"
                                icon="bxs-camera"
                                buttonText="Tomar o seleccionar foto"
                                className="gap-3"
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
                                className="gap-3"
                                value={docs.land_ownership}
                                onChange={(file) => setDocs((p) => ({ ...p, land_ownership: file }))}
                            />

                            <View className="gap-4">
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

                                {docs.land_receipts.map((receipt, idx) => (
                                    <View
                                        key={idx}
                                        className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex-row items-center justify-between"
                                    >
                                        <View className="flex-row items-center gap-3.5 flex-1 mr-2">
                                            <View className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center shrink-0">
                                                <Boxicon name="bxs-file" size={20} color="#61b346" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-800 font-bold text-base" numberOfLines={1}>
                                                    Recibo {idx + 1}
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
                                            className="h-9 w-9 bg-red-50 rounded-lg items-center justify-center"
                                        >
                                            <Boxicon name="bxs-trash" size={16} color="#dc2626" />
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
