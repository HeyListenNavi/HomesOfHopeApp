import { View, Text } from "react-native";
import React from "react";
import Boxicon from "@/components/Boxicons";

interface StatCardProps {
    value: string | number;
    label: string;
    iconName: string;
    iconColor: string;
    iconBgColor: string;
    size?: "full" | "half" | "compact";
    trend?: {
        value: string;
        label: string;
        color: string;
        bgColor: string;
        iconName: string;
    };
}

const StatCard = ({
    value,
    label,
    iconName,
    iconColor,
    iconBgColor,
    size = "full",
    trend,
}: StatCardProps) => {
    const accessibilityLabel = `${label}: ${value}${
        trend ? `, ${trend.value} ${trend.label}` : ""
    }`;

    if (size === "compact") {
        return (
            <View
                accessible
                accessibilityLabel={accessibilityLabel}
                className="bg-white flex-1 p-3 rounded-2xl items-center gap-1.5 shadow-md shadow-black/5"
            >
                <View className={`${iconBgColor} p-2 rounded-xl`}>
                    <Boxicon size={18} color={iconColor} name={iconName as any} />
                </View>
                <Text className="text-2xl font-bold text-gray-800 leading-none">
                    {value}
                </Text>
                <Text
                    className="text-sm text-gray-600 text-center"
                    numberOfLines={2}
                >
                    {label}
                </Text>
            </View>
        );
    }

    const containerClass = size === "full" ? "w-full" : "w-[48%]";

    return (
        <View
            accessible
            accessibilityLabel={accessibilityLabel}
            className={`bg-white p-6 rounded-3xl flex-row justify-between items-center shadow-md shadow-black/5 ${containerClass}`}
        >
            <View>
                <View
                    className={`${iconBgColor} self-start p-2 rounded-full mb-3`}
                >
                    <Boxicon
                        size={size === "full" ? 24 : 20}
                        color={iconColor}
                        name={iconName as any}
                    />
                </View>
                <Text
                    className={`${
                        size === "full" ? "text-4xl" : "text-3xl"
                    } font-bold text-gray-800`}
                >
                    {value}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">{label}</Text>
            </View>

            {trend && (
                <View className="items-end">
                    <View className={`${trend.bgColor} p-2 rounded-full mb-2`}>
                        <Boxicon
                            size={20}
                            color={trend.color}
                            name={trend.iconName as any}
                        />
                    </View>
                    <Text
                        className="text-2xl font-bold"
                        style={{ color: trend.color }}
                    >
                        {trend.value}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">
                        {trend.label}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default StatCard;
