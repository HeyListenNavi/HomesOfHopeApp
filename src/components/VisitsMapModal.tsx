import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    Linking,
    Platform,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import MapView, { Marker, UrlTile, Callout, MapMarker } from "react-native-maps";
import { DatePicker } from "@quidone/react-native-wheel-picker";
import { addDays, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueries } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import MapPinMarker from "@/components/MapPinMarker";
import {
    CARTO_TILE_URL,
    LIGHT_BASE_MAP_STYLE,
    getVisitMapPoint,
    VisitMapPoint,
} from "@/lib/maps";
import { formatDate, formatDateTime, toLocalDateString } from "@/lib/utils";
import {
    useVisitIndexInfinite,
    getVisitShowQueryOptions,
} from "@/services/generated/apiEndpoints";
import { VisitResource, VisitStatus } from "@/services/generated/apiTypes";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions";
import { VISIT_STATUS } from "@/lib/enums";

const TIJUANA_DEFAULT_LAT = 32.5149;
const TIJUANA_DEFAULT_LNG = -117.0382;

interface VisitsMapModalProps {
    visible: boolean;
    onClose: () => void;
    initialDate?: string;
}

const VisitsMapModal = ({
    visible,
    onClose,
    initialDate,
}: VisitsMapModalProps) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { can } = usePermissions();
    const mapRef = useRef<MapView>(null);
    const markerRefs = useRef<Record<number, MapMarker | null>>({});

    const today = toLocalDateString();
    const [selectedDate, setSelectedDate] = useState<string>(initialDate || today);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [tempDate, setTempDate] = useState<string>(initialDate || today);
    const [layerType, setLayerType] = useState<"street" | "satellite">("street");
    const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            setSelectedDate(initialDate || toLocalDateString());
        }
    }, [visible, initialDate]);

    const visitsQuery = useVisitIndexInfinite(
        { date: selectedDate, status: VisitStatus.scheduled },
        {
            query: {
                enabled: visible && !!selectedDate,
                getNextPageParam: (visitPage) => {
                    const currentPage =
                        (visitPage as any).current_page ??
                        visitPage.meta?.current_page ??
                        1;
                    const lastPage =
                        (visitPage as any).last_page ??
                        visitPage.meta?.last_page ??
                        1;
                    return currentPage < lastPage ? currentPage + 1 : undefined;
                },
                initialPageParam: 1,
            },
        }
    );

    useEffect(() => {
        if (
            visible &&
            visitsQuery.hasNextPage &&
            !visitsQuery.isFetchingNextPage
        ) {
            visitsQuery.fetchNextPage();
        }
    }, [
        visible,
        visitsQuery.hasNextPage,
        visitsQuery.isFetchingNextPage,
        visitsQuery.fetchNextPage,
    ]);

    const rawVisits = useMemo(() => {
        const all =
            visitsQuery.data?.pages.flatMap((page) => page.data ?? []) ?? [];
        return all.filter((v) => v.status === VisitStatus.scheduled);
    }, [visitsQuery.data]);

    const visitDetailQueries = useQueries({
        queries: rawVisits.map((visit) => ({
            ...getVisitShowQueryOptions(visit.id),
            enabled: visible && !!visit.id,
        })),
    });

    const isLoadingDetails = visitDetailQueries.some((q) => q.isPending);

    const visitPoints = useMemo<VisitMapPoint[]>(() => {
        const basePoints = rawVisits.map((v, idx) => {
            const detailedVisit = visitDetailQueries[idx]?.data as
                | VisitResource
                | undefined;
            return getVisitMapPoint(detailedVisit ?? v);
        });
        const coordCounts = new Map<string, number>();

        return basePoints.map((pt) => {
            if (!pt.coords) return pt;
            const key = `${pt.coords.latitude.toFixed(5)},${pt.coords.longitude.toFixed(5)}`;
            const count = coordCounts.get(key) ?? 0;
            coordCounts.set(key, count + 1);

            if (count === 0) return pt;

            const angle = (count * Math.PI) / 3;
            const radius = 0.00018 * Math.ceil(count / 6);
            return {
                ...pt,
                coords: {
                    latitude: pt.coords.latitude + Math.cos(angle) * radius,
                    longitude: pt.coords.longitude + Math.sin(angle) * radius,
                },
            };
        });
    }, [rawVisits, visitDetailQueries]);

    const mappablePoints = useMemo(
        () => visitPoints.filter((pt) => !!pt.coords),
        [visitPoints]
    );

    const selectedPoint = useMemo(
        () =>
            visitPoints.find((pt) => pt.visit.id === selectedVisitId) ??
            mappablePoints[0] ??
            visitPoints[0] ??
            null,
        [visitPoints, mappablePoints, selectedVisitId]
    );

    const fitAllMarkers = useCallback(() => {
        if (!mapRef.current || mappablePoints.length === 0) return;

        if (mappablePoints.length === 1 && mappablePoints[0].coords) {
            mapRef.current.animateToRegion(
                {
                    latitude: mappablePoints[0].coords.latitude,
                    longitude: mappablePoints[0].coords.longitude,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                },
                500
            );
            setTimeout(() => {
                markerRefs.current[mappablePoints[0].visit.id]?.showCallout();
            }, 350);
            return;
        }

        const coords = mappablePoints
            .map((p) => p.coords!)
            .filter(Boolean);

        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 90, right: 65, bottom: 180, left: 65 },
            animated: true,
        });
    }, [mappablePoints]);

    const hasInitialFitted = useRef(false);

    useEffect(() => {
        if (!visible) {
            hasInitialFitted.current = false;
            return;
        }

        const defaultPoint = mappablePoints[0] ?? visitPoints[0] ?? null;
        setSelectedVisitId((prev) => prev ?? defaultPoint?.visit.id ?? null);

        if (!hasInitialFitted.current && mappablePoints.length > 0) {
            hasInitialFitted.current = true;
            const timer = setTimeout(() => {
                fitAllMarkers();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [visible, selectedDate, mappablePoints, visitPoints, fitAllMarkers]);

    const handleGoToVisit = (visit: VisitResource) => {
        const canFinalize =
            visit.status === VisitStatus.scheduled &&
            can(Permission.visitUpdate);
        onClose();
        setTimeout(() => {
            router.push(
                canFinalize
                    ? `/visit-close/${visit.id}`
                    : `/visit-detail/${visit.id}`
            );
        }, 100);
    };

    const handleMarkerPress = (point: VisitMapPoint) => {
        setSelectedVisitId(point.visit.id);
        if (point.coords && mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: point.coords.latitude,
                    longitude: point.coords.longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                },
                350
            );
        }
    };

    const handleOpenExternalMaps = async (point: VisitMapPoint) => {
        if (!point.mapsLink) {
            ToastAndroid.show(
                "Enlace de mapas no disponible.",
                ToastAndroid.SHORT
            );
            return;
        }
        try {
            await Linking.openURL(point.mapsLink);
        } catch {
            ToastAndroid.show(
                "No se pudo abrir la aplicación de mapas.",
                ToastAndroid.SHORT
            );
        }
    };

    const shiftDate = (days: number) => {
        const current = parseISO(selectedDate);
        if (isNaN(current.getTime())) return;
        setSelectedDate(toLocalDateString(addDays(current, days)));
    };

    const openDatePicker = () => {
        setTempDate(selectedDate || today);
        setDatePickerVisible(true);
    };

    const confirmDatePicker = () => {
        setSelectedDate(toLocalDateString(tempDate));
        setDatePickerVisible(false);
    };

    const isToday = selectedDate === today;
    const formattedDateLabel = isToday
        ? `Hoy · ${formatDate(selectedDate, "d 'de' MMM")}`
        : formatDate(selectedDate, "EEE, d 'de' MMM yyyy");

    const initialMapCenter = mappablePoints[0]?.coords ?? {
        latitude: TIJUANA_DEFAULT_LAT,
        longitude: TIJUANA_DEFAULT_LNG,
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            statusBarTranslucent={true}
            onRequestClose={onClose}
        >
            <View
                className="flex-1 bg-white relative"
                style={{
                    paddingTop:
                        Platform.OS === "android"
                            ? insets.top
                            : insets.top || 12,
                }}
            >
                <View className="px-6 pt-3 pb-4 border-b border-gray-100 bg-white z-10 gap-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2 flex-1 mr-3">
                            <FluentEmoji emoji="🗺️" className="text-3xl" />
                            <View className="flex-1">
                                <Text
                                    className="font-bold text-gray-800 text-2xl leading-tight"
                                    numberOfLines={1}
                                >
                                    Mapa de Visitas
                                </Text>
                                <Text className="text-gray-500 text-sm font-medium">
                                    {visitsQuery.isPending
                                        ? "Cargando visitas..."
                                        : `${visitPoints.length} ${
                                              visitPoints.length === 1
                                                  ? "visita programada"
                                                  : "visitas programadas"
                                          }`}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                            className="h-11 w-11 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar mapa de visitas"
                        >
                            <Boxicon name="bx-x" size={26} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={() => shiftDate(-1)}
                            activeOpacity={0.8}
                            className="h-12 w-12 bg-gray-100 rounded-2xl items-center justify-center active:bg-gray-200"
                            accessibilityRole="button"
                            accessibilityLabel="Día anterior"
                        >
                            <Boxicon
                                name="bx-chevron-left"
                                size={24}
                                color="#374151"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={openDatePicker}
                            activeOpacity={0.8}
                            className="flex-1 h-12 bg-gray-100 rounded-2xl px-4 flex-row items-center justify-center gap-2 active:bg-gray-200"
                            accessibilityRole="button"
                            accessibilityLabel={`Cambiar fecha, actual: ${formattedDateLabel}`}
                        >
                            <Boxicon
                                name="bxs-calendar"
                                size={20}
                                color="#61b346"
                            />
                            <Text
                                className="text-gray-800 font-bold text-base capitalize shrink"
                                numberOfLines={1}
                            >
                                {formattedDateLabel}
                            </Text>
                            <Boxicon
                                name="bxs-chevron-down"
                                size={16}
                                color="#6b7280"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => shiftDate(1)}
                            activeOpacity={0.8}
                            className="h-12 w-12 bg-gray-100 rounded-2xl items-center justify-center active:bg-gray-200"
                            accessibilityRole="button"
                            accessibilityLabel="Día siguiente"
                        >
                            <Boxicon
                                name="bx-chevron-right"
                                size={24}
                                color="#374151"
                            />
                        </TouchableOpacity>

                        {!isToday && (
                            <TouchableOpacity
                                onPress={() => setSelectedDate(today)}
                                activeOpacity={0.85}
                                className="h-12 px-3.5 bg-primary/10 rounded-2xl items-center justify-center active:bg-primary/20"
                                accessibilityRole="button"
                                accessibilityLabel="Ir a hoy"
                            >
                                <Text className="text-primary font-bold text-sm">
                                    Hoy
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View className="flex-1 bg-[#f4f3f0] relative">
                    <MapView
                        ref={mapRef}
                        style={{ flex: 1 }}
                        mapType={
                            layerType === "satellite" ? "satellite" : "standard"
                        }
                        customMapStyle={
                            layerType === "street"
                                ? LIGHT_BASE_MAP_STYLE
                                : undefined
                        }
                        loadingEnabled={true}
                        loadingBackgroundColor="#f4f3f0"
                        toolbarEnabled={false}
                        loadingIndicatorColor="#61b346"
                        initialRegion={{
                            latitude: initialMapCenter.latitude,
                            longitude: initialMapCenter.longitude,
                            latitudeDelta: 0.08,
                            longitudeDelta: 0.08,
                        }}
                    >
                        {layerType === "street" && (
                            <UrlTile
                                urlTemplate={CARTO_TILE_URL}
                                maximumZ={19}
                                flipY={false}
                                tileSize={256}
                                zIndex={1}
                            />
                        )}

                        {mappablePoints.map((item) => {
                            const isSelected =
                                selectedPoint?.visit.id === item.visit.id;
                            return (
                                <Marker
                                    key={item.visit.id}
                                    ref={(r) => {
                                        markerRefs.current[item.visit.id] = r;
                                    }}
                                    coordinate={item.coords!}
                                    anchor={{ x: 0.5, y: 0.82 }}
                                    zIndex={isSelected ? 10 : 3}
                                    tracksViewChanges={false}
                                    onPress={() => handleMarkerPress(item)}
                                >
                                    <View collapsable={false}>
                                        <MapPinMarker type={item.pinType} />
                                    </View>
                                    <Callout
                                        tooltip={true}
                                        onPress={() =>
                                            handleGoToVisit(item.visit)
                                        }
                                    >
                                        <View
                                            collapsable={false}
                                            className="items-center"
                                            style={{ width: 260, padding: 10 }}
                                        >
                                            <View className="w-full bg-white rounded-2xl shadow-2xl p-4 shadow-black/30 border border-gray-100 gap-1.5">
                                                <View className="flex-row items-center gap-1.5">
                                                    <FluentEmoji
                                                        emoji={
                                                            item.pinType ===
                                                            "home"
                                                                ? "🏠"
                                                                : "🗺️"
                                                        }
                                                        className="text-base"
                                                    />
                                                    <Text
                                                        className="font-bold text-gray-900 text-base leading-tight flex-1"
                                                        numberOfLines={1}
                                                    >
                                                        {item.familyName}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-500 text-xs font-bold">
                                                    {item.locationLabel}
                                                </Text>
                                                {item.address ? (
                                                    <Text
                                                        className="text-gray-600 text-sm font-medium leading-snug"
                                                        numberOfLines={2}
                                                    >
                                                        {item.address}
                                                    </Text>
                                                ) : null}
                                                <View className="mt-1 pt-2 border-t border-gray-100 flex-row items-center justify-between">
                                                    <Text className="text-primary font-bold text-xs">
                                                        Toca para ir a la visita
                                                    </Text>
                                                    <Boxicon
                                                        name="bx-chevron-right"
                                                        size={16}
                                                        color="#61b346"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </Callout>
                                </Marker>
                            );
                        })}
                    </MapView>

                    {(visitsQuery.isFetching || isLoadingDetails) && (
                        <View className="absolute top-4 self-center bg-white/95 px-4 py-2 rounded-full flex-row items-center gap-2 shadow-md shadow-black/15">
                            <ActivityIndicator size="small" color="#61b346" />
                            <Text className="text-gray-700 font-bold text-xs">
                                Actualizando mapa...
                            </Text>
                        </View>
                    )}

                    {!visitsQuery.isPending && visitPoints.length === 0 && (
                        <View className="absolute inset-x-6 top-1/3 bg-white rounded-3xl p-6 items-center gap-3 shadow-xl shadow-black/15 border border-gray-100">
                            <FluentEmoji emoji="🤔" className="text-5xl" />
                            <Text className="font-bold text-gray-800 text-xl text-center">
                                No hay visitas en esta fecha
                            </Text>
                            <Text className="text-gray-500 text-sm text-center">
                                Selecciona otro día en el calendario superior para explorar sus visitas en el mapa.
                            </Text>
                        </View>
                    )}

                    <View className="absolute right-4 bottom-6 gap-3 items-end">
                        {mappablePoints.length > 0 && (
                            <TouchableOpacity
                                onPress={fitAllMarkers}
                                activeOpacity={0.85}
                                className="h-14 w-14 bg-white rounded-2xl items-center justify-center shadow-lg shadow-black/15 border border-black/5 active:bg-gray-50"
                                accessibilityRole="button"
                                accessibilityLabel="Ajustar mapa para ver todas las visitas"
                            >
                                <Boxicon
                                    name="bx-target"
                                    size={28}
                                    color="#61b346"
                                />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() =>
                                setLayerType((prev) =>
                                    prev === "street" ? "satellite" : "street"
                                )
                            }
                            activeOpacity={0.85}
                            className="h-14 w-14 bg-white rounded-2xl items-center justify-center shadow-lg shadow-black/15 border border-black/5 active:bg-gray-50"
                            accessibilityRole="button"
                            accessibilityLabel="Cambiar capa del mapa"
                        >
                            <Boxicon
                                name={
                                    layerType === "street"
                                        ? "bx-globe"
                                        : "bx-map"
                                }
                                size={28}
                                color="#61b346"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {selectedPoint && (
                    <View
                        className="px-6 pt-4 bg-white border-t border-gray-100 gap-3 shadow-lg"
                        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                    >
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => handleGoToVisit(selectedPoint.visit)}
                            className="flex-row items-start justify-between gap-3"
                        >
                            <View className="flex-1 gap-1">
                                <View className="flex-row items-center gap-2 flex-wrap">
                                    <Text
                                        className="font-bold text-gray-800 text-xl leading-tight"
                                        numberOfLines={1}
                                    >
                                        {selectedPoint.familyName}
                                    </Text>
                                    <Badge className="bg-primary/10 border-transparent px-2.5 py-1 rounded-full">
                                        <Text className="text-primary text-xs font-bold">
                                            {selectedPoint.locationLabel}
                                        </Text>
                                    </Badge>
                                    <Badge
                                        className={
                                            selectedPoint.visit.status ===
                                            VisitStatus.completed
                                                ? "bg-green-100 border-transparent px-2.5 py-1 rounded-full"
                                                : "bg-blue-100 border-transparent px-2.5 py-1 rounded-full"
                                        }
                                    >
                                        <Text
                                            className={
                                                selectedPoint.visit.status ===
                                                VisitStatus.completed
                                                    ? "text-green-700 text-xs font-bold"
                                                    : "text-blue-700 text-xs font-bold"
                                            }
                                        >
                                            {VISIT_STATUS[
                                                selectedPoint.visit.status
                                            ]?.label ??
                                                selectedPoint.visit.status}
                                        </Text>
                                    </Badge>
                                </View>

                                <Text
                                    className="text-gray-500 text-sm font-medium"
                                    numberOfLines={2}
                                >
                                    {selectedPoint.address ??
                                        (selectedPoint.coords
                                            ? `${selectedPoint.coords.latitude.toFixed(5)}, ${selectedPoint.coords.longitude.toFixed(5)}`
                                            : isLoadingDetails
                                              ? "Cargando ubicación..."
                                              : "Sin coordenadas registradas en el perfil")}
                                </Text>

                                <Text className="text-gray-400 text-xs font-semibold">
                                    {formatDateTime(
                                        selectedPoint.visit.scheduled_at
                                    )}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-3">
                            {selectedPoint.mapsLink && (
                                <TouchableOpacity
                                    onPress={() =>
                                        handleOpenExternalMaps(selectedPoint)
                                    }
                                    className="bg-gray-100 px-4 py-4 gap-1.5 rounded-2xl flex-row justify-center items-center active:bg-gray-200"
                                    accessibilityRole="button"
                                    accessibilityLabel="Abrir ruta en Google Maps"
                                >
                                    <Boxicon
                                        name="bxs-compass"
                                        size={20}
                                        color="#4b5563"
                                    />
                                    <Text className="text-gray-700 font-bold text-base">
                                        Ruta
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={() =>
                                    handleGoToVisit(selectedPoint.visit)
                                }
                                className="flex-1 bg-primary px-4 py-4 gap-2 rounded-2xl flex-row justify-center items-center shadow-lg shadow-primary/30 active:opacity-90"
                                accessibilityRole="button"
                                accessibilityLabel={`Ir a la visita de ${selectedPoint.familyName}`}
                            >
                                <Boxicon
                                    name="bxs-location"
                                    size={20}
                                    color="#ffffff"
                                />
                                <Text className="text-white font-bold text-base">
                                    Ir a la Visita
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <Modal
                    visible={datePickerVisible}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => setDatePickerVisible(false)}
                >
                    <View className="flex-1 bg-black/60 justify-center items-center p-6">
                        <View className="bg-white w-full max-w-sm rounded-3xl p-6 gap-5 shadow-2xl">
                            <View className="items-center gap-1.5 pt-1">
                                <FluentEmoji
                                    emoji="📅"
                                    className="text-4xl mb-1"
                                />
                                <Text className="font-bold text-gray-800 text-2xl text-center leading-tight">
                                    Fecha de Visitas
                                </Text>
                                <View className="flex-row items-center gap-2 mt-1">
                                    <Badge className="bg-gray-100 border-transparent px-3 py-1 rounded-full">
                                        <Text className="text-gray-700 font-bold text-sm capitalize">
                                            {formatDate(
                                                toLocalDateString(tempDate),
                                                "d 'de' MMMM 'de' yyyy"
                                            )}
                                        </Text>
                                    </Badge>
                                    <TouchableOpacity
                                        onPress={() => setTempDate(today)}
                                        className="bg-primary/10 px-3 py-1 rounded-full active:bg-primary/20"
                                        accessibilityRole="button"
                                        accessibilityLabel="Seleccionar fecha de hoy"
                                    >
                                        <Text className="text-primary font-bold text-sm">
                                            Hoy
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="bg-gray-50 p-2 rounded-3xl overflow-hidden items-center justify-center border border-gray-100">
                                <DatePicker
                                    date={parseISO(tempDate) as any}
                                    onDateChanged={({ date }) =>
                                        setTempDate(toLocalDateString(date))
                                    }
                                    minDate={parseISO("2020-01-01") as any}
                                    maxDate={parseISO("2035-12-31") as any}
                                    locale="es"
                                    itemHeight={48}
                                    visibleItemCount={5}
                                    enableScrollByTapOnItem
                                    itemTextStyle={{
                                        fontSize: 17,
                                        color: "#1f2937",
                                        textTransform: "capitalize",
                                    }}
                                    overlayItemStyle={{
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        borderRadius: 16,
                                        borderTopWidth: 0,
                                        borderBottomWidth: 0,
                                    }}
                                />
                            </View>

                            <View className="gap-2.5 pt-1">
                                <TouchableOpacity
                                    onPress={confirmDatePicker}
                                    className="bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                                    accessibilityRole="button"
                                    accessibilityLabel="Confirmar Fecha"
                                >
                                    <Boxicon
                                        name="bxs-check-circle"
                                        size={22}
                                        color="#ffffff"
                                    />
                                    <Text className="text-white font-bold text-base">
                                        Ver Visitas del Día
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setDatePickerVisible(false)}
                                    className="py-3 items-center justify-center active:opacity-70"
                                    accessibilityRole="button"
                                    accessibilityLabel="Cancelar"
                                >
                                    <Text className="text-gray-500 font-bold text-base">
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

export default VisitsMapModal;
