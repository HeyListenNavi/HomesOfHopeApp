import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
    ScrollView,
    Keyboard,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    getPlusCodeForCoords,
    searchPlaces,
    reverseGeocode,
    GeocodedPlace,
    parseCoordinates,
} from "@/lib/geo";
import MapPinMarker from "./MapPinMarker";
import { debounce } from "lodash";

export interface LocationPickerResult {
    latitude: number;
    longitude: number;
    address?: string;
    colony?: string;
    city?: string;
    mapsUrl: string;
    plusCode: string;
}

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    type?: "land" | "home";
    initialLatitude?: number | string | null;
    initialLongitude?: number | string | null;
    initialAddress?: string | null;
    onConfirm: (result: LocationPickerResult) => void;
}

const CARTO_VOYAGER_URL =
    "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png";

const LIGHT_BASE_MAP_STYLE = [
    { elementType: "geometry", stylers: [{ color: "#f4f3f0" }] },
    { elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
];


const TIJUANA_DEFAULT_LAT = 32.5149;
const TIJUANA_DEFAULT_LNG = -117.0382;

const LocationPickerModal = ({
    visible,
    onClose,
    title,
    type = "land",
    initialLatitude,
    initialLongitude,
    initialAddress,
    onConfirm,
}: LocationPickerModalProps) => {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);

    const parsedCoords = parseCoordinates(initialLatitude, initialLongitude);
    const startLat = parsedCoords?.latitude ?? TIJUANA_DEFAULT_LAT;
    const startLng = parsedCoords?.longitude ?? TIJUANA_DEFAULT_LNG;

    const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
        latitude: startLat,
        longitude: startLng,
    });
    const [layerType, setLayerType] = useState<"street" | "satellite">("street");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<GeocodedPlace[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<{
        address?: string;
        colony?: string;
        city?: string;
        displayName?: string;
    } | null>(initialAddress ? { address: initialAddress } : null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

    const plusCode = getPlusCodeForCoords(coords.latitude, coords.longitude) || "";

    
    useEffect(() => {
        if (!visible) return;
        const initCoords = parseCoordinates(initialLatitude, initialLongitude);
        const lat = initCoords?.latitude ?? TIJUANA_DEFAULT_LAT;
        const lng = initCoords?.longitude ?? TIJUANA_DEFAULT_LNG;
        setCoords({ latitude: lat, longitude: lng });
        setSelectedPlaceInfo(initialAddress ? { address: initialAddress } : null);
        setSearchQuery("");
        setSuggestions([]);

        const timer = setTimeout(() => {
            mapRef.current?.animateToRegion(
                {
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                },
                400
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [visible, initialLatitude, initialLongitude, initialAddress]);

    
    const executeSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim() || query.trim().length < 2) {
                setSuggestions([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            try {
                const results = await searchPlaces(query);
                setSuggestions(results);
            } catch {
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 400),
        []
    );

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        executeSearch(text);
    };

    const handleSelectSuggestion = (place: GeocodedPlace) => {
        Keyboard.dismiss();
        setSuggestions([]);
        setSearchQuery("");
        setCoords({ latitude: place.latitude, longitude: place.longitude });
        setSelectedPlaceInfo({
            address: place.address,
            colony: place.colony,
            city: place.city,
        });

        mapRef.current?.animateToRegion(
            {
                latitude: place.latitude,
                longitude: place.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            },
            500
        );
    };

    const handleMapPress = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoords({ latitude, longitude });
        setSuggestions([]);
        try {
            const geo = await reverseGeocode(latitude, longitude);
            if (geo) {
                setSelectedPlaceInfo({
                    displayName: [geo.address, geo.colony, geo.city].filter(Boolean).join(", "),
                    address: geo.address,
                    colony: geo.colony,
                    city: geo.city,
                });
            }
        } catch {
            
        }
    };

    const handleMarkerDragEnd = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoords({ latitude, longitude });
        try {
            const geo = await reverseGeocode(latitude, longitude);
            if (geo) {
                setSelectedPlaceInfo({
                    displayName: [geo.address, geo.colony, geo.city].filter(Boolean).join(", "),
                    address: geo.address,
                    colony: geo.colony,
                    city: geo.city,
                });
            }
        } catch {
            
        }
    };

    const handleConfirm = async () => {
        setIsReverseGeocoding(true);
        let finalAddr = selectedPlaceInfo?.address;
        let finalColony = selectedPlaceInfo?.colony;
        let finalCity = selectedPlaceInfo?.city;

        if (!finalAddr || !finalColony) {
            try {
                const geo = await reverseGeocode(coords.latitude, coords.longitude);
                if (geo) {
                    finalAddr = finalAddr || geo.address;
                    finalColony = finalColony || geo.colony;
                    finalCity = finalCity || geo.city;
                }
            } catch {
                
            }
        }

        if (!finalAddr && selectedPlaceInfo?.displayName) {
            finalAddr = selectedPlaceInfo.displayName.split(",")[0]?.trim();
        }

        if (!finalAddr && plusCode) {
            finalAddr = `Plus Code: ${plusCode}`;
        }

        setIsReverseGeocoding(false);
        const mapsUrl = `https://www.google.com/maps?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;

        onConfirm({
            latitude: coords.latitude,
            longitude: coords.longitude,
            address: finalAddr || undefined,
            colony: finalColony || undefined,
            city: finalCity || undefined,
            mapsUrl,
            plusCode,
        });
        onClose();
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
                        Platform.OS === "android" ? insets.top : insets.top || 12,
                }}
            >
                {}
                <View className="flex-1 bg-[#f4f3f0] relative">
                    <MapView
                        ref={mapRef}
                        style={{ flex: 1 }}
                        mapType={layerType === "satellite" ? "satellite" : "standard"}
                        customMapStyle={layerType === "street" ? LIGHT_BASE_MAP_STYLE : undefined}
                        loadingEnabled={true}
                        loadingBackgroundColor="#f4f3f0"
                        loadingIndicatorColor="#61b346"
                        toolbarEnabled={false}
                        onPress={handleMapPress}
                        initialRegion={{
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            latitudeDelta: 0.008,
                            longitudeDelta: 0.008,
                        }}
                    >
                        {layerType === "street" && (
                            <UrlTile
                                urlTemplate={CARTO_VOYAGER_URL}
                                maximumZ={19}
                                flipY={false}
                                tileSize={256}
                                zIndex={1}
                            />
                        )}

                        <Marker
                            coordinate={coords}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            anchor={{ x: 0.5, y: 0.82 }}
                            zIndex={3}
                        >
                            <View collapsable={false}>
                                <MapPinMarker type={type} />
                            </View>
                        </Marker>
                    </MapView>

                    {}
                    <View className="absolute top-3 left-4 right-4 z-30 gap-2">
                        <View className="flex-row items-center gap-2">
                            <View className="flex-1 bg-white/95 backdrop-blur-md flex-row items-center px-4 min-h-[58px] rounded-2xl shadow-xl shadow-black/20 border border-black/5">
                                <Boxicon size={22} color="#61b346" name="bx-search" />
                                <TextInput
                                    placeholder="Buscar colonia, Plus Code o coordenadas..."
                                    placeholderTextColor="#9ca3af"
                                    value={searchQuery}
                                    onChangeText={handleSearchChange}
                                    style={{ paddingVertical: 0, textAlignVertical: "center" }}
                                    className="flex-1 ml-3 text-base text-gray-800 font-medium py-0 h-full"
                                    clearButtonMode="while-editing"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {isSearching && (
                                    <ActivityIndicator size="small" color="#61b346" className="ml-2" />
                                )}
                                {searchQuery.length > 0 && !isSearching && (
                                    <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
                                        <Boxicon name="bxs-x-circle" size={18} color="#9ca3af" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {}
                            <TouchableOpacity
                                onPress={onClose}
                                activeOpacity={0.8}
                                className="h-[58px] w-[58px] bg-white/95 backdrop-blur-md rounded-2xl items-center justify-center shadow-xl shadow-black/20 border border-black/5 active:bg-gray-100"
                                accessibilityRole="button"
                                accessibilityLabel="Cerrar selector de mapa"
                            >
                                <Boxicon name="bx-x" size={26} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {}
                        {suggestions.length > 0 && (
                            <View className="bg-white rounded-2xl border border-gray-200 max-h-60 shadow-2xl shadow-black/25 overflow-hidden">
                                <ScrollView keyboardShouldPersistTaps="handled">
                                    {suggestions.map((item, idx) => (
                                        <TouchableOpacity
                                            key={`${item.latitude}-${item.longitude}-${idx}`}
                                            onPress={() => handleSelectSuggestion(item)}
                                            className="p-3.5 border-b border-gray-100 flex-row items-center gap-3 active:bg-gray-50"
                                        >
                                            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center shrink-0">
                                                <Boxicon name="bxs-location" size={16} color="#61b346" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-800 font-bold text-sm" numberOfLines={1}>
                                                    {item.displayName}
                                                </Text>
                                                <Text className="text-gray-400 text-xs mt-0.5">
                                                    {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {}
                    <View className="absolute right-4 bottom-6 gap-3 items-end">
                        <TouchableOpacity
                            onPress={() => {
                                mapRef.current?.animateToRegion(
                                    {
                                        latitude: coords.latitude,
                                        longitude: coords.longitude,
                                        latitudeDelta: 0.006,
                                        longitudeDelta: 0.006,
                                    },
                                    400
                                );
                            }}
                            activeOpacity={0.85}
                            className="h-13 w-13 p-3.5 bg-white rounded-2xl items-center justify-center shadow-lg shadow-black/15 border border-black/5 active:bg-gray-50"
                            accessibilityLabel="Centrar en el pin"
                        >
                            <Boxicon name="bx-target" size={26} color="#61b346" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setLayerType((prev) => (prev === "street" ? "satellite" : "street"))}
                            activeOpacity={0.85}
                            className="h-13 w-13 p-3.5 bg-white rounded-2xl items-center justify-center shadow-lg shadow-black/15 border border-black/5 active:bg-gray-50"
                            accessibilityLabel="Alternar vista de mapa"
                        >
                            <Boxicon
                                name={layerType === "street" ? "bx-globe" : "bx-map"}
                                size={26}
                                color="#61b346"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {}
                <View
                    className="px-6 py-4 bg-white border-t border-gray-100 gap-3 shadow-lg shadow-black/10"
                    style={{ paddingBottom: 36 }}
                >
                    <View className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-1 mr-2">
                            <View className="flex-row items-center gap-1.5">
                                <Boxicon name="bxs-location" size={16} color="#61b346" />
                                <Text className="text-gray-800 font-bold text-sm">
                                    {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                                </Text>
                            </View>
                            {plusCode ? (
                                <Text className="text-gray-500 text-xs font-medium mt-0.5">
                                    Plus Code: <Text className="font-bold text-gray-700">{plusCode}</Text>
                                </Text>
                            ) : null}
                        </View>

                        <View className="bg-primary/10 px-2.5 py-1 rounded-full">
                            <Text className="text-primary font-bold text-xs capitalize">
                                {type === "land" ? "Terreno" : "Casa"}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={isReverseGeocoding}
                        className="w-full bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                        accessibilityRole="button"
                        accessibilityLabel="Confirmar ubicación seleccionada"
                    >
                        {isReverseGeocoding && <ActivityIndicator color="white" size="small" />}
                        <Text className="text-white font-bold text-base">
                            Confirmar Ubicación
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default LocationPickerModal;
