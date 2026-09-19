import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";

interface QuickActionButtonProps {
    onPress?: () => void;
    iconName: BoxIconName;
    label: string;
    className?: string;
}

const QuickActionButton = ({
    onPress,
    iconName,
    label,
    className,
}: QuickActionButtonProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
            className={`items-center gap-2 min-h-[88px] ${className}`}
        >
            <View className="bg-primary p-5 rounded-2xl shadow-lg shadow-primary/30">
                <Boxicon name={iconName} size={28} color="white" />
            </View>
            <Text
                className="text-sm text-gray-700 font-semibold text-center"
                numberOfLines={1}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default QuickActionButton;
