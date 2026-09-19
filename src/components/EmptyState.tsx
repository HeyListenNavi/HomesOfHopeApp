import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import FluentEmoji from "@/components/FluentEmoji";

interface EmptyStateProps {
    emoji?: string;
    title: string;
    subtitle?: string;
    className?: string;
}

const EmptyState = ({
    emoji = "🤔",
    title,
    subtitle,
    className,
}: EmptyStateProps) => {
    return (
        <View
            className={`bg-white p-8 rounded-3xl items-center gap-8 shadow-md shadow-black/5 ${className}`}
        >
            <FluentEmoji
                emoji={emoji}
                className="text-5xl"
                accessible={false}
                importantForAccessibility="no-hide-descendants"
            />
            <View className="gap-2">
                <Text className="text-primary font-bold text-center text-2xl">
                    {title}
                </Text>
                {subtitle ? (
                    <Text className="text-gray-500 text-sm text-center">
                        {subtitle}
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

export default EmptyState;
