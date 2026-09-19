import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { Badge } from "@/components/ui/badge";
import { Label } from "./ui/label";
import FluentEmoji from "./FluentEmoji";

export interface YesNoToggleProps {
    label: string;
    description?: string;
    value: boolean | null | undefined;
    onChange: (val: boolean) => void;
    yesLabel?: string;
    noLabel?: string;
    yesColor?: "primary" | "amber" | "green";
    noColor?: "primary" | "amber" | "gray";
    required?: boolean;
    optional?: boolean;
    error?: string;
}

const YesNoToggle = ({
    label,
    description,
    value,
    onChange,
    yesLabel = "Sí",
    noLabel = "No",
    yesColor = "primary",
    noColor = "gray",
    required = false,
    optional = false,
    error,
}: YesNoToggleProps) => {
    return (
        <View className="gap-2">
            <View className="flex-row items-start justify-between gap-2 px-1">
                <Text className="py-0.5 text-base font-bold text-gray-700 flex-1 shrink leading-snug">
                    {label}
                    {required && <Text className="text-red-500 font-black text-base"> *</Text>}
                </Text>
            </View>

            {description && (
                <Text className="text-gray-500 text-sm font-medium -mt-0.5 mb-1 px-1 leading-normal">
                    {description}
                </Text>
            )}

            <View className="flex-col gap-3">
                {}
                <TouchableOpacity
                    onPress={() => onChange(true)}
                    activeOpacity={0.85}
                    className={`w-full min-h-[64px] px-5 py-3.5 rounded-2xl flex-row items-center gap-4 border-2 ${
                        value === true
                            ? yesColor === "amber"
                                ? "border-amber-500 bg-amber-50"
                                : "border-primary bg-primary/10"
                            : "border-gray-200 bg-gray-50 active:bg-gray-100"
                    }`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: value === true }}
                    accessibilityLabel={`${label}: ${yesLabel}`}
                >
                    <View
                        className={`w-8 h-8 rounded-xl items-center justify-center shrink-0 ${
                            value === true
                                ? yesColor === "amber"
                                    ? "bg-amber-600"
                                    : "bg-primary"
                                : "border-2 border-gray-300 bg-white"
                        }`}
                    >
                        {value === true && (
                            <Boxicon name="bx-check" size={20} color="#ffffff" />
                        )}
                    </View>
                    <Text
                        className={`flex-1 text-lg font-bold leading-snug ${
                            value === true
                                ? yesColor === "amber"
                                    ? "text-amber-950 font-black"
                                    : "text-primary font-black"
                                : "text-gray-800"
                        }`}
                    >
                        {yesLabel}
                    </Text>
                </TouchableOpacity>

                {}
                <TouchableOpacity
                    onPress={() => onChange(false)}
                    activeOpacity={0.85}
                    className={`w-full min-h-[64px] px-5 py-3.5 rounded-2xl flex-row items-center gap-4 border-2 ${
                        value === false
                            ? noColor === "amber"
                                ? "border-amber-500 bg-amber-50"
                                : noColor === "primary"
                                ? "border-primary bg-primary/10"
                                : "border-gray-400 bg-gray-200"
                            : "border-gray-200 bg-gray-50 active:bg-gray-100"
                    }`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: value === false }}
                    accessibilityLabel={`${label}: ${noLabel}`}
                >
                    <View
                        className={`w-8 h-8 rounded-xl items-center justify-center shrink-0 ${
                            value === false
                                ? noColor === "amber"
                                    ? "bg-amber-600"
                                    : noColor === "primary"
                                    ? "bg-primary"
                                    : "bg-gray-700"
                                : "border-2 border-gray-300 bg-white"
                        }`}
                    >
                        {value === false && (
                            <Boxicon name="bx-check" size={20} color="#ffffff" />
                        )}
                    </View>
                    <Text
                        className={`flex-1 text-lg font-bold leading-snug ${
                            value === false
                                ? noColor === "amber"
                                    ? "text-amber-950 font-black"
                                    : noColor === "primary"
                                    ? "text-primary font-black"
                                    : "text-gray-900 font-black"
                                : "text-gray-800"
                        }`}
                    >
                        {noLabel}
                    </Text>
                </TouchableOpacity>
            </View>

            {error && (
                <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-2xl mt-0.5">
                    <FluentEmoji emoji="⚠️" className="text-lg" />
                    <Text className="text-red-700 font-bold text-sm flex-1">
                        {error}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default YesNoToggle;
