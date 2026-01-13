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
            className={`items-center gap-2 ${className}`}
        >
            <View className="bg-primary/90 p-5 rounded-2xl">
                <Boxicon name={iconName} size={28} color="white" />
            </View>
            <Text className="text-xs text-gray-500 font-medium text-center">
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default QuickActionButton;
