import { TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Checkbox as ReusableCheckbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

export interface CheckboxProps
    extends React.ComponentProps<typeof ReusableCheckbox> {
    id?: string;
    label?: string;
    placeholder?: string;
    iconName?: BoxIconName;
    prefix?: string;
}

const Checkbox = ({
    id,
    label,
    iconName,
    placeholder,
    prefix,
    ...props
}: CheckboxProps) => {
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

            <View className="relative min-h-[60px] flex-row items-center bg-gray-100/60 rounded-2xl px-4 py-3">
                {prefix && (
                    <Text className="ml-2 font-bold text-gray-400">
                        {prefix}
                    </Text>
                )}

                {placeholder && (
                    <Text className="flex-1 ml-2 mr-2 text-gray-900" id={id}>
                        {placeholder}
                    </Text>
                )}

                <TouchableOpacity className="w-16 ml-auto bg-gray-200/50 p-1 rounded-lg flex-row items-center">
                    <Text
                        className={`w-1/2 py-0.5 rounded-md text-center text-sm font-medium ${
                            !props.checked
                                ? "text-green-600 bg-white"
                                : "text-gray-400"
                        }`}
                    >
                        No
                    </Text>

                    <Text
                        className={`w-1/2 py-0.5 rounded-md text-center text-sm font-medium ${
                            props.checked
                                ? "text-green-600 bg-white"
                                : "text-gray-400"
                        }`}
                    >
                        Si
                    </Text>
                </TouchableOpacity>
                <ReusableCheckbox
                    nativeID={id}
                    aria-labelledby={id}
                    id={id}
                    indicatorClassName="bg-transparent"
                    iconClassName="text-transparent"
                    className="bg-transparent border-transparent flex-1 p-4 absolute w-full h-full"
                    {...props}
                />
            </View>
        </View>
    );
};

export default Checkbox;
