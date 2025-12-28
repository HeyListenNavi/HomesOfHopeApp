import { Animated, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Checkbox as ReusableCheckbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

export interface CheckboxProps
    extends React.ComponentProps<typeof ReusableCheckbox> {
    id?: string;
    label?: string;
    placeholder?: string;
    iconName?: BoxIconName;
    prefix?: string;
}

const Checkbox = ({
    id,
    label,
    iconName,
    placeholder,
    prefix,
    ...props
}: CheckboxProps) => {
    const fadeAnim = useRef(new Animated.Value(props.checked ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: props.checked ? 1 : 0,
            duration: 50,
            useNativeDriver: true,
        }).start();
    }, [props.checked]);

    return (
        <View className="gap-2">
            <View className="flex-row gap-2 items-center">
                {iconName && (
                    <Boxicon name={iconName} color="#9ca3af" size={18} />
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

            <View className="relative min-h-[60px] flex-row items-center bg-gray-100/60 rounded-2xl px-4 py-3">
                <TouchableOpacity className="relative size-7 justify-center items-center">
                    <Animated.View
                        className="absolute"
                        style={{
                            opacity: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0],
                            }),
                        }}
                    >
                        <Text className="text-gray-300">
                            <Boxicon name="bx-checkbox" size={28} />
                        </Text>
                    </Animated.View>

                    <Animated.View
                        className="absolute"
                        style={{
                            opacity: fadeAnim,
                        }}
                    >
                        <Text className="text-primary">
                            <Boxicon name="bxs-checkbox-checked" size={28} />
                        </Text>
                    </Animated.View>
                </TouchableOpacity>

                {prefix && (
                    <Text className="ml-2 font-bold text-gray-400">
                        {prefix}
                    </Text>
                )}

                {placeholder && (
                    <Text className="flex-1 ml-2 mr-2 text-gray-900" id={id}>
                        {placeholder}
                    </Text>
                )}

                <ReusableCheckbox
                    nativeID={id}
                    aria-labelledby={id}
                    id={id}
                    indicatorClassName="bg-transparent"
                    iconClassName="text-transparent"
                    className="bg-transparent border-transparent flex-1 p-4 absolute w-full h-full"
                    {...props}
                />
            </View>
        </View>
    );
};

export default Checkbox;
