import { View, Animated, Pressable } from 'react-native'
import React from 'react'
import type { MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from 'expo-router/js-top-tabs';
import type { NavigationHelpers, ParamListBase, TabNavigationState } from 'expo-router/react-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomTabBarProps {
    state: TabNavigationState<ParamListBase>;
    descriptors: Record<string, { options: MaterialTopTabNavigationOptions }>;
    navigation: NavigationHelpers<ParamListBase, MaterialTopTabNavigationEventMap>;
    position: Animated.AnimatedInterpolation<number>;
}

export { CustomTabBarProps };

const CustomTabBar = ({
    state,
    descriptors,
    navigation,
    position,
}: CustomTabBarProps)  => {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="absolute left-6 right-6 bg-white rounded-full flex-row shadow-lg shadow-black/20"
            style={{ 
                bottom: insets.bottom > 0 ? insets.bottom + 4 : 12, 
                paddingVertical: 8,
                paddingHorizontal: 8,
                elevation: 10,
                zIndex: 50
            }}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

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
                        className="flex-1 items-center justify-center py-2"
                    >
                        <View
                            className={`px-4 py-2.5 rounded-full flex-row items-center justify-center gap-1.5 transition-all ${isFocused ? "bg-primary" : "bg-transparent"}`}
                        >
                            {options.tabBarIcon &&
                                options.tabBarIcon({
                                    focused: isFocused,
                                    color: isFocused ? "#ffffff" : "#9ca3af",
                                })}
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default CustomTabBar