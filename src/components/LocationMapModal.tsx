import React, { useState, useRef, useEffect } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    Linking,
    Platform,
    Text,
} from "react-native";
import MapView, { Marker, UrlTile, Callout, MapMarker } from "react-native-maps";
import Boxicon from "@/components/Boxicons";
import * as Clipboard from "expo-clipboard";
import { getPlusCodeForCoords } from "@/lib/geo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapPinMarker from "./MapPinMarker";
import FluentEmoji from "@/components/FluentEmoji";
import { CARTO_TILE_URL, LIGHT_BASE_MAP_STYLE } from "@/lib/maps";

export interface LocationPoint {
    type: "land" | "home";
    title: string;
    address?: string | null;
    latitude: number;
    longitude: number;
}

interface LocationMapModalProps {
    visible: boolean;
    onClose: () => void;
    activePoint: LocationPoint;
    secondaryPoint?: LocationPoint | null;
}

const LocationMapModal = ({
    visible,
    onClose,
    activePoint,
    secondaryPoint,
}: LocationMapModalProps) => {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const activeMarkerRef = useRef<MapMarker>(null);
    const secondaryMarkerRef = useRef<MapMarker>(null);
    const [layerType, setLayerType] = useState<"street" | "satellite">("street");
    const [selectedPoint, setSelectedPoint] = useState<LocationPoint>(activePoint);
    const [focusTarget, setFocusTarget] = useState<"land" | "home" | "both">(
        activePoint.type
    );
    const [copiedCode, setCopiedCode] = useState(false);

    
    const currentPlusCode = getPlusCodeForCoords(
        selectedPoint.latitude,
        selectedPoint.longitude
    );
    const hasBothPoints = !!secondaryPoint;

    
    useEffect(() => {
        if (!visible) return;

        setSelectedPoint(activePoint);
        setFocusTarget(activePoint.type);
        const timer = setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.animateToRegion(
                    {
                        latitude: activePoint.latitude,
                        longitude: activePoint.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    },
                    500
                );
            }
            if (activeMarkerRef.current) {
                activeMarkerRef.current.showCallout();
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [visible, activePoint]);

    const handleToggleLayer = () => {
        setLayerType((prev) => (prev === "street" ? "satellite" : "street"));
    };

    const handleFocus = (target: "land" | "home" | "both") => {
        activeMarkerRef.current?.hideCallout();
        secondaryMarkerRef.current?.hideCallout();

        setFocusTarget(target);
        if (!mapRef.current) return;

        if (target === "both" && secondaryPoint) {
            mapRef.current.fitToCoordinates(
                [
                    {
                        latitude: activePoint.latitude,
                        longitude: activePoint.longitude,
                    },
                    {
                        latitude: secondaryPoint.latitude,
                        longitude: secondaryPoint.longitude,
                    },
                ],
                {
                    edgePadding: { top: 140, right: 60, bottom: 120, left: 60 },
                    animated: true,
                }
            );
        } else {
            const pointToFocus =
                target === activePoint.type ? activePoint : secondaryPoint;
            const targetMarker =
                target === activePoint.type ? activeMarkerRef : secondaryMarkerRef;

            if (pointToFocus) {
                setSelectedPoint(pointToFocus);
                mapRef.current.animateToRegion(
                    {
                        latitude: pointToFocus.latitude,
                        longitude: pointToFocus.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    },
                    500
                );
                setTimeout(() => {
                    targetMarker.current?.showCallout();
                }, 300);
            }
        }
    };

    const handleOpenGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${selectedPoint.latitude},${selectedPoint.longitude}`;
        Linking.openURL(url);
    };

    const handleCopyPlusCode = async () => {
        if (!currentPlusCode) return;
        await Clipboard.setStringAsync(currentPlusCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
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
                <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between bg-white z-10">
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center gap-1.5">
                            <FluentEmoji
                                emoji={selectedPoint.type === "land" ? "🗺️" : "🏠"}
                                className="text-2xl"
                            />
                            <Text
                                className="font-bold text-gray-800 text-3xl leading-tight"
                                numberOfLines={1}
                            >
                                {selectedPoint.type === "land" ? "Terreno" : "Casa"}
                            </Text>
                        </View>
                        {selectedPoint.address ? (
                            <Text
                                className="text-gray-600 text-lg font-medium mt-1"
                                numberOfLines={2}
                            >
                                {selectedPoint.address}
                            </Text>
                        ) : null}
                    </View>

                    {}
                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.7}
                        className="h-12 w-12 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
                    >
                        <Boxicon name="bx-x" size={28} color="#374151" />
                    </TouchableOpacity>
                </View>

                {}
                <View className="flex-1 bg-[#f4f3f0] relative">
                    <MapView
                        ref={mapRef}
                        style={{ flex: 1 }}
                        mapType={layerType === "satellite" ? "satellite" : "standard"}
                        customMapStyle={
                            layerType === "street" ? LIGHT_BASE_MAP_STYLE : undefined
                        }
                        loadingEnabled={true}
                        loadingBackgroundColor="#f4f3f0"
                        toolbarEnabled={false}
                        loadingIndicatorColor="#61b346"
                        initialRegion={{
                            latitude: activePoint.latitude,
                            longitude: activePoint.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                    >
                        {}
                        {layerType === "street" && (
                            <UrlTile
                                urlTemplate={CARTO_TILE_URL}
                                maximumZ={19}
                                flipY={false}
                                tileSize={256}
                                zIndex={1}
                            />
                        )}

                        {}
                        <Marker
                            ref={activeMarkerRef}
                            coordinate={{
                                latitude: activePoint.latitude,
                                longitude: activePoint.longitude,
                            }}
                            anchor={{ x: 0.5, y: 0.82 }}
                            zIndex={3}
                            tracksViewChanges={false}
                            onPress={() => setSelectedPoint(activePoint)}
                        >
                            <View collapsable={false}>
                                <MapPinMarker type={activePoint.type} />
                            </View>
                            <Callout tooltip={true}>
                                <View collapsable={false} className="items-center" style={{ width: 260, padding: 12 }}>
                                    <View className="w-full bg-white rounded-2xl shadow-2xl p-4 shadow-black/30 border border-gray-100 gap-1">
                                        <View className="flex-row items-center gap-1.5">
                                            <FluentEmoji
                                                emoji={activePoint.type === "home" ? "🏠" : "🗺️"}
                                                className="text-lg"
                                            />
                                            <Text className="font-bold text-gray-900 text-lg leading-tight">
                                                {activePoint.type === "home" ? "Casa Actual" : "Terreno"}
                                            </Text>
                                        </View>
                                        {activePoint.address ? (
                                            <Text
                                                className="text-gray-700 text-base font-medium leading-snug"
                                                numberOfLines={3}
                                            >
                                                {activePoint.address}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            </Callout>
                        </Marker>

                        {secondaryPoint && (
                            <Marker
                                ref={secondaryMarkerRef}
                                coordinate={{
                                    latitude: secondaryPoint.latitude,
                                    longitude: secondaryPoint.longitude,
                                }}
                                anchor={{ x: 0.5, y: 0.82 }}
                                zIndex={3}
                                tracksViewChanges={false}
                                onPress={() => setSelectedPoint(secondaryPoint)}
                            >
                                <View collapsable={false}>
                                    <MapPinMarker type={secondaryPoint.type} />
                                </View>
                                <Callout tooltip={true}>
                                    <View collapsable={false} className="items-center" style={{ width: 260, padding: 12 }}>
                                        <View className="w-full bg-white rounded-2xl p-4 shadow-2xl shadow-black/30 border border-gray-100 gap-1">
                                            <View className="flex-row items-center gap-1.5 mb-0.5">
                                                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                                                <FluentEmoji
                                                    emoji={secondaryPoint.type === "home" ? "🏠" : "🗺️"}
                                                    className="text-lg"
                                                />
                                                <Text className="font-bold text-gray-900 text-lg leading-tight">
                                                    {secondaryPoint.type === "home"
                                                        ? "Casa Actual"
                                                        : "Terreno"}
                                                </Text>
                                            </View>
                                            {secondaryPoint.address ? (
                                                <Text
                                                    className="text-gray-700 text-base font-medium leading-snug"
                                                    numberOfLines={3}
                                                >
                                                    {secondaryPoint.address}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>
                                </Callout>
                            </Marker>
                        )}
                    </MapView>

                    {hasBothPoints && (
                        <View className="absolute top-4 left-4 right-4 items-center">
                            {}
                            <View className="bg-white p-2 rounded-2xl flex-row items-center shadow-lg shadow-black/30">
                                <TouchableOpacity
                                    onPress={() => handleFocus("land")}
                                    activeOpacity={0.8}
                                    className={`px-5 py-3.5 rounded-xl ${focusTarget === "land"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                        }`}
                                >
                                    <View
                                            className={`font-bold text-base flex-row items-center gap-1.5 ${focusTarget === "land"
                                                ? "text-white"
                                                : "text-gray-800"
                                                }`}
                                        >
                                            <FluentEmoji
                                                emoji="🗺️"
                                                className={`text-lg ${focusTarget === "land" ? "text-white" : "text-gray-800"}`}
                                            />
                                            <Text
                                                className={`font-bold text-base ${focusTarget === "land"
                                                    ? "text-white"
                                                    : "text-gray-800"
                                                    }`}
                                            >
                                                Terreno
                                            </Text>
                                        </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleFocus("home")}
                                    activeOpacity={0.8}
                                    className={`px-5 py-3.5 rounded-xl ${focusTarget === "home"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                        }`}
                                >
                                    <View
                                            className={`font-bold text-base flex-row items-center gap-1.5 ${focusTarget === "home"
                                                ? "text-white"
                                                : "text-gray-800"
                                                }`}
                                        >
                                            <FluentEmoji
                                                emoji="🏠"
                                                className={`text-lg ${focusTarget === "home" ? "text-white" : "text-gray-800"}`}
                                            />
                                            <Text
                                                className={`font-bold text-base ${focusTarget === "home"
                                                    ? "text-white"
                                                    : "text-gray-800"
                                                    }`}
                                            >
                                                Casa
                                            </Text>
                                        </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleFocus("both")}
                                    activeOpacity={0.8}
                                    className={`px-5 py-3.5 rounded-xl ${focusTarget === "both"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                        }`}
                                >
                                    <Text
                                        className={`font-bold text-base ${focusTarget === "both"
                                            ? "text-white"
                                            : "text-gray-800"
                                            }`}
                                    >
                                        Ver Ambos
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {}
                    <View className="absolute right-4 bottom-6 gap-3 items-end">
                        {}
                        <TouchableOpacity
                            onPress={() => handleFocus(selectedPoint.type)}
                            activeOpacity={0.85}
                            className="h-14 w-14 bg-white rounded-2xl items-center justify-center shadow-lg shadow-black/15 border border-black/5 active:bg-gray-50"
                        >
                            <Boxicon name="bx-target" size={28} color="#61b346" />
                        </TouchableOpacity>

                        {}
                        <TouchableOpacity
                            onPress={handleToggleLayer}
                            activeOpacity={0.85}
                            className="h-14 w-14 bg-white rounded-2xl items-center justify-center shadow-lg shadow-black/15 border border-black/5 active:bg-gray-50"
                        >
                            <Boxicon
                                name={layerType === "street" ? "bx-globe" : "bx-map"}
                                size={28}
                                color="#61b346"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {}
                <View
                    className="px-6 py-4 bg-white border-t border-gray-100 flex-row items-center gap-3 shadow-lg"
                    style={{ paddingBottom: 36 }}
                >
                    {}
                    {currentPlusCode && (
                        <TouchableOpacity
                            className="flex-1 bg-gray-100 px-4 py-4 gap-1.5 rounded-2xl flex-row justify-center items-center active:bg-gray-200"
                            onPress={handleCopyPlusCode}
                        >
                            <Boxicon
                                name={copiedCode ? "bx-check" : "bxs-copy"}
                                size={22}
                                color="#4b5563"
                            />
                            <Text className="text-gray-700 font-bold text-base" numberOfLines={1}>
                                {copiedCode ? "¡Copiado!" : `Plus: ${currentPlusCode}`}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {}
                    <TouchableOpacity
                        onPress={handleOpenGoogleMaps}
                        className="flex-1 bg-primary px-4 py-4 gap-1.5 rounded-2xl flex-row justify-center items-center shadow-lg shadow-primary/30 active:opacity-90"
                    >
                        <Boxicon name="bxs-compass" size={22} color="#ffffff" />
                        <Text className="text-white font-bold text-base">
                            Abrir en Maps
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default LocationMapModal;
