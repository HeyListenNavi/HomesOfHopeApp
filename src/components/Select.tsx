import { ScrollView } from "react-native-gesture-handler";
import { View, Keyboard } from "react-native";
import React, { useState } from "react";
import * as SelectPrimitive from "@rn-primitives/select";
import { Check } from "lucide-react-native";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
    Select as ReusableSelect,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectTrigger,
} from "@/components/ui/select";
import FluentEmoji from "./FluentEmoji";

export interface SelectOption {
    label: string;
    value: string;
    emoji?: string;
}

export interface SelectProps {
    id?: string;
    label?: string;
    iconName?: BoxIconName;
    placeholder?: string;
    options: SelectOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    optional?: boolean;
}

const Select = ({
    id,
    label,
    iconName,
    placeholder = "Seleccionar...",
    options,
    value,
    onValueChange,
    error,
    required = false,
    optional = false,
}: SelectProps) => {
    const selectedOption = options.find((opt) => opt.value === value);
    const [triggerWidth, setTriggerWidth] = useState(0);

    return (
        <View className="gap-2">
            {(label || iconName) && (
                <View className="flex-row items-start justify-between gap-2 px-1">
                    <View className="flex-row gap-2 items-start flex-1 shrink">
                        {iconName && (
                            <Boxicon
                                name={iconName}
                                color="#61b346"
                                size={20}
                                className="mt-0.5"
                            />
                        )}
                        {label && (
                            <Text
                                nativeID={id}
                                className="py-0.5 text-base font-bold text-gray-700 flex-1 shrink leading-snug"
                            >
                                {label}
                                {required && <Text className="text-red-500 font-black text-base"> *</Text>}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            <ReusableSelect
                value={
                    value
                        ? { value: value, label: selectedOption?.label || "" }
                        : undefined
                }
                onValueChange={(opt) => onValueChange?.(opt?.value || "")}
            >
                <SelectTrigger
                    id={id}
                    nativeID={id}
                    onPress={() => Keyboard.dismiss()}
                    className={`h-fit min-h-[60px] flex-row items-center bg-gray-50 border ${
                        error ? "border-red-400 bg-red-50" : "border-gray-200"
                    } rounded-2xl px-4 py-3 active:bg-gray-100`}
                    onLayout={(ev) =>
                        setTriggerWidth(ev.nativeEvent.layout.width)
                    }
                >
                    {value ? (
                        <View className="mr-auto flex-1 flex-row items-center gap-2">
                            {selectedOption?.emoji && (
                                <FluentEmoji emoji={selectedOption.emoji} className="text-lg" />
                            )}
                            <Text
                                className="flex-1 shrink text-gray-900 font-semibold text-lg"
                                numberOfLines={1}
                            >
                                {selectedOption?.label || value}
                            </Text>
                        </View>
                    ) : (
                        <Text className="mr-auto text-gray-400 font-semibold text-lg">
                            {placeholder}
                        </Text>
                    )}
                </SelectTrigger>

                <SelectContent
                    className="mt-1 bg-white rounded-3xl p-2 shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden"
                    style={{ width: triggerWidth }}
                >
                    <SelectGroup>
                        {label && (
                            <SelectLabel className="text-sm font-bold text-gray-400 px-3 py-2">
                                {label}
                            </SelectLabel>
                        )}

                        <ScrollView
                            style={{ maxHeight: 260 }}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                        >
                            {options.map((item) => {
                                const isSelected = item.value === value;
                                return (
                                    <SelectPrimitive.Item
                                        key={item.value}
                                        label={item.label}
                                        value={item.value}
                                        className={`rounded-2xl px-3.5 py-3 my-0.5 ${
                                            isSelected ? "bg-primary/10" : "active:bg-gray-100"
                                        }`}
                                    >
                                        <View className="flex-1 flex-row items-center gap-2 pr-6">
                                            {item.emoji && (
                                                <FluentEmoji emoji={item.emoji} className="text-lg" />
                                            )}
                                            <Text
                                                className={`flex-1 shrink text-base ${
                                                    isSelected
                                                        ? "font-extrabold text-primary"
                                                        : "font-medium text-gray-800"
                                                }`}
                                            >
                                                {item.label}
                                            </Text>
                                        </View>
                                        <View className="absolute right-3 flex size-4 items-center justify-center">
                                            <SelectPrimitive.ItemIndicator>
                                                <Icon
                                                    as={Check}
                                                    className="size-4 shrink-0 text-primary"
                                                />
                                            </SelectPrimitive.ItemIndicator>
                                        </View>
                                    </SelectPrimitive.Item>
                                );
                            })}
                        </ScrollView>
                    </SelectGroup>
                </SelectContent>
            </ReusableSelect>
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

export default Select;

