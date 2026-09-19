import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Boxicon from "@/components/Boxicons";

interface MapPinMarkerProps {
    type: "land" | "home";
}

const MapPinMarker = ({ type }: MapPinMarkerProps) => {
    const iconName = type === "home" ? "bxs-home" : "bxs-map";
    const gradientId = `diffusedShadow-${type}`;

    return (
        <View
            className="items-center justify-center relative"
            style={{ width: 54, height: 76, paddingTop: 2 }}
        >
            {}
            <View
                style={{
                    width: 48,
                    height: 62,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                }}
            >
                <Svg width={48} height={62} viewBox="0 0 48 62" fill="none">
                    <Path
                        d="M24 3C11.2975 3 1 13.2975 1 26C1 40.5 24 61 24 61C24 61 47 40.5 47 26C47 13.2975 36.7025 3 24 3Z"
                        fill="#61b346"
                    />
                    <Circle cx={24} cy={25} r={16} fill="white" />
                </Svg>

                {}
                <View
                    className="absolute items-center justify-center"
                    style={{ top: 3, left: 0, width: 48, height: 44 }}
                >
                    <Boxicon name={iconName} size={22} color="#61b346" />
                </View>
            </View>

            {}
            <View
                style={{
                    width: 28,
                    height: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -9,
                    zIndex: 1,
                }}
            >
                <Svg width={28} height={28} viewBox="0 0 28 28">
                    <Defs>
                        <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                            <Stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                            <Stop offset="40%" stopColor="#000000" stopOpacity="0.22" />
                            <Stop offset="80%" stopColor="#000000" stopOpacity="0.06" />
                            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx={14} cy={14} r={13} fill={`url(#${gradientId})`} />
                </Svg>
            </View>
        </View>
    );
};

export default MapPinMarker;
