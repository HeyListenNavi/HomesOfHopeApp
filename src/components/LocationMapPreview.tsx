import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import Boxicon from "@/components/Boxicons";
import LocationMapModal, { LocationPoint } from "./LocationMapModal";
import MapPinMarker from "./MapPinMarker";
import { CARTO_TILE_URL, LIGHT_BASE_MAP_STYLE } from "@/lib/maps";

interface LocationMapPreviewProps {
    activePoint: LocationPoint;
    secondaryPoint?: LocationPoint | null;
}

const LocationMapPreview = ({
    activePoint,
    secondaryPoint,
}: LocationMapPreviewProps) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View className="gap-3">
            {}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.9}
                className="h-72 w-full rounded-2xl overflow-hidden relative border border-gray-200 bg-[#f4f3f0] shadow-sm"
                accessibilityLabel={`Ver mapa interactivo de ${activePoint.title}`}
            >
                {}
                <View pointerEvents="none" className="flex-1">
                    <MapView
                        style={{ flex: 1 }}
                        mapType="standard"
                        customMapStyle={LIGHT_BASE_MAP_STYLE}
                        loadingEnabled={true}
                        loadingBackgroundColor="#f4f3f0"
                        loadingIndicatorColor="#61b346"
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        initialRegion={{
                            latitude: activePoint.latitude,
                            longitude: activePoint.longitude,
                            latitudeDelta: 0.006,
                            longitudeDelta: 0.006,
                        }}
                    >
                        {}
                        <UrlTile
                            urlTemplate={CARTO_TILE_URL}
                            maximumZ={19}
                            flipY={false}
                            tileSize={256}
                            zIndex={1}
                        />

                        {}
                        <Marker
                            coordinate={{
                                latitude: activePoint.latitude,
                                longitude: activePoint.longitude,
                            }}
                            anchor={{ x: 0.5, y: 0.82 }}
                            tracksViewChanges={false}
                        >
                            <View collapsable={false}>
                                <MapPinMarker type={activePoint.type} />
                            </View>
                        </Marker>
                    </MapView>
                </View>

                {}
                <View className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full flex-row items-center gap-2 shadow-md shadow-black/10 border border-black/5">
                    <Boxicon name="bx-fullscreen" size={16} color="#61b346" />
                    <Text className="text-gray-800 text-sm font-bold">
                        Toca para explorar
                    </Text>
                </View>
            </TouchableOpacity>

            {}
            {modalVisible && (
                <LocationMapModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    activePoint={activePoint}
                    secondaryPoint={secondaryPoint}
                />
            )}
        </View>
    );
};

export default LocationMapPreview;
