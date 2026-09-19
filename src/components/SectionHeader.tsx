import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import FluentEmoji from "@/components/FluentEmoji";

export interface SectionHeaderProps {
    emoji?: string;
    title: string;
    description?: string;
    badge?: string | React.ReactNode;
    actionLabel?: string;
    onActionPress?: () => void;
    action?: React.ReactNode;
    className?: string;
}

const SectionHeader = ({
    emoji,
    title,
    description,
    badge,
    actionLabel,
    onActionPress,
    action,
    className,
}: SectionHeaderProps) => {
    return (
        <View className={`w-full gap-1 ${className || ""}`}>
            {}
            <View className="flex-row items-center justify-between gap-2 w-full">
                <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                    {emoji ? (
                        <FluentEmoji
                            emoji={emoji}
                            className="text-2xl"
                            accessible={false}
                            importantForAccessibility="no-hide-descendants"
                        />
                    ) : null}
                    <Text
                        className="font-bold text-gray-800 text-xl leading-tight flex-1"
                        numberOfLines={2}
                    >
                        {title}
                    </Text>
                </View>

                {badge ? (
                    typeof badge === "string" ? (
                        <Badge
                            className={`border-transparent px-2.5 py-0.5 rounded-full shrink-0 ${
                                badge.toLowerCase() === "requerido" || badge.toLowerCase() === "required"
                                    ? "bg-red-50"
                                    : "bg-gray-100"
                            }`}
                        >
                            <Text
                                className={`text-xs font-bold ${
                                    badge.toLowerCase() === "requerido" || badge.toLowerCase() === "required"
                                        ? "text-red-600"
                                        : "text-gray-500"
                                }`}
                            >
                                {badge}
                            </Text>
                        </Badge>
                    ) : (
                        badge
                    )
                ) : action ? (
                    action
                ) : actionLabel && onActionPress ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={onActionPress}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="shrink-0"
                    >
                        <Text className="text-primary text-sm font-bold">
                            {actionLabel}
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {}
            {description ? (
                <Text className="text-gray-500 text-sm font-medium leading-normal mt-0.5">
                    {description}
                </Text>
            ) : null}
        </View>
    );
};

export default SectionHeader;
