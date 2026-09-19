import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import FluentEmoji from "./FluentEmoji";

export interface NumberStepperProps {
    label: string;
    description?: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    unitSingular?: string;
    unitPlural?: string;
    error?: string;
}

const NumberStepper = ({
    label,
    description,
    value = 1,
    onChange,
    min = 1,
    max = 20,
    unitSingular = "Persona",
    unitPlural = "Personas",
    error,
}: NumberStepperProps) => {
    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    return (
        <View className="gap-2">
            <View className="px-1">
                <Text className="text-base font-bold text-gray-700 leading-snug">
                    {label}
                </Text>
                {description && (
                    <Text className="text-gray-500 text-sm font-medium mt-0.5 leading-normal">
                        {description}
                    </Text>
                )}
            </View>

            <View className="bg-gray-50 border border-gray-200 min-h-[72px] rounded-2xl p-2 px-3 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={handleDecrement}
                    disabled={value <= min}
                    activeOpacity={0.7}
                    className={`h-14 w-14 rounded-2xl items-center justify-center ${
                        value <= min
                            ? "bg-gray-200 opacity-40"
                            : "bg-white border border-gray-200 active:bg-gray-100"
                    }`}
                    accessibilityLabel="Disminuir cantidad"
                >
                    <Boxicon
                        name="bx-minus"
                        size={28}
                        color={value <= min ? "#9ca3af" : "#374151"}
                    />
                </TouchableOpacity>

                <View className="items-center px-4 flex-row gap-2.5">
                    <Text className="text-4xl font-black text-gray-900 leading-none">
                        {value}
                    </Text>
                    <Text className="text-base font-bold text-gray-500">
                        {value === 1 ? unitSingular : unitPlural}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleIncrement}
                    disabled={value >= max}
                    activeOpacity={0.85}
                    className={`h-14 w-14 rounded-2xl items-center justify-center ${
                        value >= max
                            ? "bg-gray-200 opacity-40"
                            : "bg-primary active:opacity-90"
                    }`}
                    accessibilityLabel="Aumentar cantidad"
                >
                    <Boxicon
                        name="bx-plus"
                        size={28}
                        color={value >= max ? "#9ca3af" : "#ffffff"}
                    />
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

export default NumberStepper;
