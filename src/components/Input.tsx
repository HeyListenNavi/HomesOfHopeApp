import { View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Input as ReusableInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { debounce as debounceFunction } from "lodash";
import FluentEmoji from "./FluentEmoji";

export interface InputProps extends React.ComponentProps<typeof ReusableInput> {
    id?: string;
    label?: string;
    iconName?: BoxIconName;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    className?: string;
    inputClassName?: string;
    children?: React.ReactNode;
    inSheet?: boolean;
    debounce?: boolean;
    debounceDelay?: number;
    error?: string;
    required?: boolean;
    optional?: boolean;
    ref?: React.Ref<React.ComponentRef<typeof ReusableInput>>;
}

const Input = ({
    id,
    label,
    iconName,
    prefix,
    suffix,
    className,
    inputClassName,
    children,
    inSheet,
    value,
    onChangeText,
    debounce = false,
    debounceDelay = 500,
    error,
    required = false,
    optional = false,
    ref,
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
        <View className={`gap-2 ${className || ""}`}>
            {(label || iconName || children) && (
                <View className="flex-row items-start justify-between gap-2 px-1">
                    <View className="flex-row gap-2 items-start flex-1">
                        {iconName && (
                            <View className="pt-0.5">
                                <Boxicon name={iconName} color="#61b346" size={20} />
                            </View>
                        )}
                        {label && (
                            <Text
                                className="text-base font-bold text-gray-700 flex-1 leading-snug"
                                nativeID={id}
                            >
                                {label}
                                {required ? (
                                    <Text className="text-red-500 font-black text-base">
                                        {" *"}
                                    </Text>
                                ) : null}
                            </Text>
                        )}
                        {children}
                    </View>
                </View>
            )}

            <View
                className={`min-h-[60px] flex-row items-center bg-gray-50 border ${
                    error ? "border-red-400 bg-red-50" : "border-gray-200"
                } rounded-2xl px-4 py-3 ${inputClassName}`}
            >
                {typeof prefix === "string" ? (
                    <Text className="text-gray-500 font-bold text-lg mr-1">{prefix}</Text>
                ) : prefix}
                
                <InputComponent
                    ref={ref}
                    nativeID={id}
                    aria-labelledby={id}
                    id={id}
                    style={{ backgroundColor: "transparent" }}
                    className="flex-1 grow-1 shadow-none border-transparent text-gray-900 text-lg font-medium"
                    cursorColor="#61b346"
                    selectionColor="#61b3466f"
                    selectionHandleColor="#61b346"
                    placeholderTextColor="#9ca3af"
                    value={debounce ? localValue : value}
                    onChangeText={handleTextChange}
                    {...props}
                />

                {suffix}
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

export default Input;
