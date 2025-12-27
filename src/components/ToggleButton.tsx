import { TouchableOpacity, View } from "react-native";
import React from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Text } from "@/components/ui/text";

export interface ToggleButtonProps {
    label?: string;
    iconName?: BoxIconName;
    isSelected: boolean;
    onPress: () => void;
    className?: string; 
}

const ToggleButton = ({
    label,
    iconName,
    isSelected,
    onPress,
    className,
}: ToggleButtonProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`grow-0 rounded-2xl ${
                isSelected ? "bg-primary" : "bg-gray-100"
            } ${className}`}
        >
            <View className="w-full flex-col gap-1 items-center justify-center rounded-2xl py-3 min-h-[96px]">
                {iconName && (
                    <Boxicon
                        name={iconName}
                        size={24}
                        color={isSelected ? "#ffffff" : "#6b7280"}
                    />
                )}

                {label && (
                    <Text
                        className={`font-medium text-center text-sm ${
                            isSelected ? "text-white" : "text-gray-500"
                        }`}
                    >
                        {label}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ToggleButton;