import { View } from "react-native";
import React from "react";
import { Label } from "@/components/ui/label";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import ToggleButton from "@/components/ToggleButton";

export interface ToggleOption {
    value: string;
    label?: string;
    iconName?: BoxIconName;
}

interface ToggleGroupProps {
    id?: string;
    label?: string;
    iconName?: BoxIconName;
    items: ToggleOption[];
    value: string[];
    onValueChange: (value: string[]) => void;
}

const ToggleGroup = ({
    items,
    label,
    id,
    iconName,
    value = [],
    onValueChange,
}: ToggleGroupProps) => {
    const handlePress = (itemValue: string) => {
        const currentValues = Array.isArray(value) ? value : [];

        if (currentValues.includes(itemValue)) {
            onValueChange(currentValues.filter((v) => v !== itemValue));
        } else {
            onValueChange([...currentValues, itemValue]);
        }
    };

    return (
        <View className="gap-2">
            <View className="flex-row gap-2 items-center">
                {iconName && (
                    <Boxicon name={iconName} color="#9ca3af" size={18} />
                )}
                {label && (
                    <Label
                        nativeID={id}
                        id={id}
                        className="py-0.5 text-gray-500"
                    >
                        {label}
                    </Label>
                )}
            </View>

            <View className="flex-row flex-wrap gap-2">
                {items.map((item) => {
                    const isSelected = Array.isArray(value)
                        ? value.includes(item.value)
                        : false;

                    return (
                        <ToggleButton
                            key={item.value}
                            label={item.label}
                            iconName={item.iconName}
                            isSelected={isSelected}
                            onPress={() => handlePress(item.value)}
                            className="w-[31%]"
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default ToggleGroup;
