import { View, Text, TouchableOpacity, Animated, Pressable } from 'react-native'
import React from 'react'
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({
    state,
    descriptors,
    navigation,
    position,
}: MaterialTopTabBarProps)  => {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="flex-row bg-white"
            style={{ paddingBottom: insets.bottom }}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];

                const inputRange = state.routes.map((_, i) => i);

                const activeOpacity = position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((i) => (i === index ? 1 : 0)),
                });

                const inactiveOpacity = position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((i) => (i === index ? 0 : 1)),
                });

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

                    const isFocused = state.index === index;
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: "tabLongPress",
                        target: route.key,
                    });
                };

                return (
                    <Pressable
                        key={route.key}
                        role="button"
                        onPress={onPress}
                        onLongPress={onLongPress}
                        className="flex-1 items-center justify-center py-3"
                    >
                        <View
                            style={{
                                width: 24,
                                height: 28,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Animated.View
                                style={{
                                    opacity: activeOpacity,
                                    position: "absolute",
                                }}
                            >
                                {options.tabBarIcon &&
                                    options.tabBarIcon({
                                        focused: true,
                                        color: options.tabBarActiveTintColor || "#2563eb",
                                    })}
                            </Animated.View>
                            <Animated.View
                                style={{
                                    opacity: inactiveOpacity,
                                    position: "absolute",
                                }}
                            >
                                {options.tabBarIcon &&
                                    options.tabBarIcon({
                                        focused: false,
                                        color: "#94a3b8",
                                    })}
                            </Animated.View>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default CustomTabBar