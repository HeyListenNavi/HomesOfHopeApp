import { View } from "react-native";
import React, { useState } from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Label } from "@/components/ui/label";
import {
    Select as ReusableSelect,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
    label: string;
    value: string;
}

export interface SelectProps {
    id?: string;
    label?: string;
    iconName?: BoxIconName;
    placeholder?: string;
    options: SelectOption[];
    value?: string;
    onValueChange?: (value: string) => void;
}

const Select = ({
    id,
    label,
    iconName,
    placeholder = "Seleccionar...",
    options,
    value,
    onValueChange,
}: SelectProps) => {
    const selectedLabel = options.find((opt) => opt.value === value)?.label;
    const [triggerWidth, setTriggerWidth] = useState(0);

    return (
        <View className="gap-2">
            <View className="flex-row gap-2 items-center">
                {iconName && (
                    <Boxicon
                        name={iconName}
                        color="#9ca3af"
                        size={18}
                    />
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

            <ReusableSelect
                value={
                    value
                        ? { value: value, label: selectedLabel || "" }
                        : undefined
                }
                onValueChange={(opt) => onValueChange?.(opt?.value || "")}
            >
                <SelectTrigger
                    id={id}
                    nativeID={id}
                    className="h-fit min-h-[60px] flex-row items-center bg-gray-100/60 rounded-2xl px-4 py-3 border-0"
                    onLayout={(ev) =>
                        setTriggerWidth(ev.nativeEvent.layout.width)
                    }
                >
                    <SelectValue
                        className={`mr-auto text-base flex-1 ${
                            !value ? "text-gray-400" : "text-gray-900"
                        }`}
                        placeholder={placeholder}
                    />
                </SelectTrigger>

                <SelectContent
                    className="mt-1 bg-gray-50 rounded-2xl shadow-xl shadow-black/5 border border-black/5"
                    style={{ width: triggerWidth }}
                >
                    <SelectGroup>
                        {label && (
                            <SelectLabel className="text-base">
                                {label}
                            </SelectLabel>
                        )}

                        {options.map((item) => (
                            <SelectItem
                                key={item.value}
                                label={item.label}
                                value={item.value}
                            >
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </ReusableSelect>
        </View>
    );
};

export default Select;
