import { View } from "react-native";
import React from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Textarea as ReusableTextarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import FluentEmoji from "./FluentEmoji";

export interface TextareaProps
    extends React.ComponentProps<typeof ReusableTextarea> {
    id?: string;
    label?: string;
    iconName?: BoxIconName;
    prefix?: string;
    children?: React.ReactNode;
    error?: string;
    required?: boolean;
    optional?: boolean;
}

const Textarea = ({
    id,
    label,
    iconName,
    prefix,
    children,
    error,
    required = false,
    optional = false,
    ...props
}: TextareaProps) => {
    return (
        <View className="gap-2">
            {(label || iconName || children) && (
                <View className="flex-row items-start justify-between gap-2 px-1">
                    <View className="flex-row gap-2 items-start flex-1 shrink">
                        {iconName && (
                            <Boxicon name={iconName} color="#61b346" size={20} className="mt-0.5" />
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
                        {children}
                    </View>
                </View>
            )}

            <View
                className={`min-h-[100px] flex-row items-start bg-gray-50 border ${
                    error ? "border-red-400 bg-red-50" : "border-gray-200"
                } rounded-2xl px-4 py-3`}
            >
                {prefix && (
                    <Text className="mt-1 mr-1 text-lg font-bold text-gray-400">
                        {prefix}
                    </Text>
                )}

                <ReusableTextarea
                    nativeID={id}
                    aria-labelledby={id}
                    id={id}
                    placeholderTextColor="#9ca3af"
                    style={{ backgroundColor: "transparent" }}
                    className="flex-1 grow-1 shadow-none border-transparent text-gray-900 text-lg font-medium leading-relaxed"
                    cursorColor="#61b346"
                    selectionColor="#61b3466f"
                    selectionHandleColor="#61b346"
                    {...props}
                />
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

export default Textarea;
