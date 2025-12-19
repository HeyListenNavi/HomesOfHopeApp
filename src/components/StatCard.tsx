import { View, Text } from "react-native";
import React from "react";
import Boxicon from "@/components/Boxicons";

interface StatCardProps {
    value: string | number;
    label: string;
    iconName: string;
    iconColor: string;
    iconBgColor: string;
    size?: "full" | "half";
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
    const containerClass =
        size === "full"
            ? "w-full"
            : "w-[48%]";

    return (
        <View className={`bg-white p-5 rounded-3xl flex-row justify-between items-center ${containerClass}`}>
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
                <Text
                    className={`text-gray-500 ${
                        size === "full" ? "text-sm" : "text-xs"
                    } mt-1`}
                >
                    {label}
                </Text>
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
                    <View className="flex-row items-baseline">
                        <Text
                            className="text-2xl font-bold"
                            style={{ color: trend.color }}
                        >
                            {trend.value}
                        </Text>
                        <Text
                            className="text-sm font-bold ml-1"
                            style={{ color: trend.color }}
                        >
                            %
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-xs">{trend.label}</Text>
                </View>
            )}
        </View>
    );
};

export default StatCard;
