import React from "react";
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
} from "expo-router/js-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "expo-router/react-navigation";
import CustomTabBar, { CustomTabBarProps } from "@/components/CustomTabBar";
import Boxicon from "@/components/Boxicons";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabsLayout() {
    return (
        <MaterialTopTabs
            initialRouteName="index"
            tabBarPosition="bottom"
            tabBar={(props: CustomTabBarProps) => <CustomTabBar {...props} />}
            screenOptions={{
                swipeEnabled: true,
                animationEnabled: true,
                lazy: true,
                tabBarActiveTintColor: "#61b346",
            }}
        >
            <MaterialTopTabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, focused }) => (
                        <Boxicon
                            name={focused ? "bxs-home" : "bxs-home"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="visits"
                options={{
                    title: "Visitas",
                    tabBarIcon: ({ color, focused }) => (
                        <Boxicon
                            name={focused ? "bxs-location" : "bxs-location"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="interviews"
                options={{
                    title: "Entrevistas",
                    tabBarIcon: ({ color, focused }) => (
                        <Boxicon
                            name={focused ? "bxs-clipboard-detail" : "bxs-clipboard-detail"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="families"
                options={{
                    title: "Perfiles",
                    tabBarIcon: ({ color, focused }) => (
                        <Boxicon
                            name={focused ? "bxs-home-heart" : "bxs-home-heart"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="team"
                options={{
                    title: "Equipo",
                    tabBarIcon: ({ color, focused }) => (
                        <Boxicon
                            name={focused ? "bxs-user" : "bxs-user"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </MaterialTopTabs>
    );
}
