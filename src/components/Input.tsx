import { View } from "react-native";
import React from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Input as ReusableInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

export interface InputProps extends React.ComponentProps<typeof ReusableInput> {
    id?: string;
    label?: string;
    iconName?: BoxIconName;
    prefix?: string;
    className?: string;
    children?: React.ReactNode;
}

const Input = ({ id, label, iconName, prefix, className, children, ...props }: InputProps) => {
    return (
        <View className={`gap-2 ${
            className
        }`}>
            <View className="flex-row gap-2 items-center">
                {iconName && (
                    <Boxicon name={iconName} color="#9ca3af" size={18} />
                )}
                {label && (
                    <Label className="py-0.5 text-gray-500" id={id}>
                        {label}
                    </Label>
                )}
                {children}
            </View>

            <View className="min-h-[60px] flex-row items-center bg-gray-100/60 rounded-2xl px-4 py-3">
                {prefix && (
                    <Text className="ml-2 font-bold text-gray-400">
                        {prefix}
                    </Text>
                )}

                <ReusableInput
                    nativeID={id}
                    aria-labelledby={id}
                    id={id}
                    className="flex-1 grow-1 bg-transparent shadow-none border-transparent text-gray-900"
                    cursorColor="#61b346"
                    selectionColor="#61b3466f"
                    selectionHandleColor="#61b346"
                    {...props}
                />
            </View>
        </View>
    );
};

export default Input;
