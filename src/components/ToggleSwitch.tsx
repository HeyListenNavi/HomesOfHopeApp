import { Pressable, Animated, LayoutRectangle, View } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { Text } from "@/components/ui/text";

interface ToggleSwitchProps<T extends string | number> {
    value: T;
    onValueChange: (value: T) => void;
    leftLabel: string;
    leftValue: T;
    rightLabel: string;
    rightValue: T;
    className?: string;
}

function ToggleSwitch<T extends string | number>({
    value,
    onValueChange,
    leftLabel,
    leftValue,
    rightLabel,
    rightValue,
    className,
}: ToggleSwitchProps<T>) {
    const animatedValue = useRef(new Animated.Value(value === leftValue ? 0 : 1)).current;

    const [layouts, setLayouts] = useState<{
        left: LayoutRectangle | null;
        right: LayoutRectangle | null;
    }>({ left: null, right: null });

    const handlePress = () => {
        const newValue = value === leftValue ? rightValue : leftValue;
        onValueChange(newValue);
    };

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value === leftValue ? 0 : 1,
            duration: 50,
            useNativeDriver: false,
        }).start();
    }, [value, leftValue]);

    const isReady = layouts.left && layouts.right;
    const leftPos = layouts.left?.x || 0;
    const rightPos = layouts.right?.x || 0;
    const leftWidth = layouts.left?.width || 0;
    const rightWidth = layouts.right?.width || 0;

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [leftPos, rightPos],
    });

    const width = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [leftWidth, rightWidth],
    });

    return (
        <Pressable
            onPress={handlePress}
            className={`relative self-start bg-gray-200/50 p-1 rounded-lg flex-row items-center ${className}`}
        >
            {isReady && (
                <Animated.View
                    className="absolute bg-white rounded-md shadow-sm"
                    style={{
                        top: 4, 
                        bottom: 4, 
                        left: 0, 
                        transform: [{ translateX }],
                        width: width,
                    }}
                />
            )}

            <View
                onLayout={(e) => {
                    const layout = e.nativeEvent.layout;
                    setLayouts((prev) => ({ ...prev, left: layout }));
                }}
            >
                <Text
                    className={`px-3 py-1 rounded-md text-center text-sm font-bold z-10 ${
                        value === leftValue ? "text-green-600" : "text-gray-400"
                    }`}
                >
                    {leftLabel}
                </Text>
            </View>

            <View
                onLayout={(e) => {
                    const layout = e.nativeEvent.layout;
                    setLayouts((prev) => ({ ...prev, right: layout }));
                }}
            >
                <Text
                    className={`px-3 py-1 rounded-md text-center text-sm font-bold z-10 ${
                        value === rightValue ? "text-green-600" : "text-gray-400"
                    }`}
                >
                    {rightLabel}
                </Text>
            </View>
        </Pressable>
    );
}

export default ToggleSwitch;