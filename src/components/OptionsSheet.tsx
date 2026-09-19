
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheet from "@/components/BottomSheet";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import { Badge } from "@/components/ui/badge";

export interface SheetOption {
    label: string;
    subtitle?: string;
    icon: BoxIconName;
    color?: string;
    iconBgColor?: string;
    badge?: string;
    badgeBgColor?: string;
    badgeTextColor?: string;
    danger?: boolean;
    onPress: () => void;
}

export interface OptionsSheetProps {
    options: SheetOption[];
    title?: string;
    subtitle?: string;
    emoji?: string;
    ref?: React.Ref<BottomSheetModal>;
}

const OptionsSheet = ({
    options,
    title = "Seleccionar opción",
    subtitle,
    emoji,
    ref,
}: OptionsSheetProps) => {
    return (
        <BottomSheet ref={ref} scrollable={false}>
            <View style={styles.content} className="gap-5">
                <View className="items-center gap-1 pt-1 pb-1">
                    {emoji && (
                        <View className="mb-1">
                            <FluentEmoji emoji={emoji} className="text-4xl" />
                        </View>
                    )}
                    <Text className="font-bold text-gray-800 text-2xl text-center leading-tight">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-gray-500 text-base font-medium text-center leading-snug px-4">
                            {subtitle}
                        </Text>
                    )}
                </View>

                <View className="gap-3">
                    {options.map((opt, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                                if (ref && "current" in ref) {
                                    ref.current?.dismiss();
                                }
                                setTimeout(opt.onPress, 220);
                            }}
                            className={`bg-white p-4 rounded-3xl flex-row items-center gap-4 shadow-md shadow-black/5 active:bg-gray-100 ${
                                opt.danger ? "bg-red-50 active:bg-red-100" : ""
                            }`}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel={`${opt.label}${opt.badge ? `, ${opt.badge}` : ""}`}
                        >
                            <View
                                className={`h-16 w-16 rounded-2xl items-center justify-center shrink-0 ${
                                    opt.iconBgColor
                                        ? opt.iconBgColor
                                        : opt.danger
                                        ? "bg-red-100"
                                        : "bg-primary/10"
                                }`}
                            >
                                <Boxicon
                                    name={opt.icon}
                                    size={28}
                                    color={
                                        opt.danger
                                            ? "#ef4444"
                                            : opt.color ?? "#61b346"
                                    }
                                />
                            </View>

                            <View className="flex-1 flex-row items-center justify-between gap-2">
                                <View className="flex-1">
                                    <Text
                                        className={`font-bold text-xl leading-tight ${
                                            opt.danger ? "text-red-600" : "text-gray-800"
                                        }`}
                                    >
                                        {opt.label}
                                    </Text>
                                    {opt.subtitle && (
                                        <Text
                                            className={`text-sm font-medium mt-0.5 ${
                                                opt.danger ? "text-red-400" : "text-gray-500"
                                            }`}
                                        >
                                            {opt.subtitle}
                                        </Text>
                                    )}
                                </View>

                                {opt.badge && (
                                    <Badge
                                        className={`${
                                            opt.badgeBgColor || "bg-primary/10"
                                        } border-transparent px-3 py-1 rounded-full`}
                                    >
                                        <Text
                                            className={`${
                                                opt.badgeTextColor || "text-primary"
                                            } text-sm font-bold`}
                                        >
                                            {opt.badge}
                                        </Text>
                                    </Badge>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={() => {
                        if (ref && "current" in ref) {
                            ref.current?.dismiss();
                        }
                    }}
                    className="mt-1 py-4 rounded-2xl bg-gray-100 items-center active:bg-gray-200"
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar"
                >
                    <Text className="font-bold text-gray-600 text-base">
                        Cancelar
                    </Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        zIndex: 2,
    },
});

export default OptionsSheet;
