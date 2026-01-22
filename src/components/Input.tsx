import { View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Input as ReusableInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { debounce as debounceFunction } from "lodash";

export interface InputProps extends React.ComponentProps<typeof ReusableInput> {
    id?: string;
    label?: string;
    iconName?: BoxIconName;
    prefix?: string;
    className?: string;
    inputClassName?: string;
    children?: React.ReactNode;
    inSheet?: boolean;
    debounce?: boolean;
    debounceDelay?: number;
}

const Input = ({
    id,
    label,
    iconName,
    prefix,
    className,
    inputClassName,
    children,
    inSheet,
    value,
    onChangeText,
    debounce = false,
    debounceDelay = 500,
    ...props
}: InputProps) => {
    const [localValue, setLocalValue] = useState(value || "");

    const InputComponent = (
        inSheet ? BottomSheetTextInput : ReusableInput
    ) as any;

    useEffect(() => {
        if (value !== undefined) {
            setLocalValue(value);
        }
    }, [value]);

    const debouncedCallback = useCallback(
        debounceFunction((text: string) => {
            if (onChangeText) onChangeText(text);
        }, debounceDelay),
        [onChangeText, debounceDelay]
    );

    const handleTextChange = (text: string) => {
        if (debounce) {
            setLocalValue(text);
            debouncedCallback(text);
            return;
        }

        if (onChangeText) onChangeText(text);
    };

    return (
        <View className={`gap-2 ${className}`}>

            {(label || iconName || children) && (
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
            )}

            <View className={`min-h-[60px] flex-row items-center bg-gray-100/60 rounded-2xl px-4 py-3 ${inputClassName}`}>
                {prefix && (
                    <Text className="ml-2 font-bold text-gray-400">
                        {prefix}
                    </Text>
                )}

                <InputComponent
                    nativeID={id}
                    aria-labelledby={id}
                    id={id}
                    className="flex-1 grow-1 bg-transparent shadow-none border-transparent text-gray-900"
                    cursorColor="#61b346"
                    selectionColor="#61b3466f"
                    selectionHandleColor="#61b346"
                    placeholderTextColor="#9ca3af"
                    value={debounce ? localValue : value}
                    onChangeText={handleTextChange}
                    {...props}
                />
            </View>
        </View>
    );
};

export default Input;
