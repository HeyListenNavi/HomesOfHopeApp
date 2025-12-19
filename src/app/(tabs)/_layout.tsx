import React from "react";
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import CustomTabBar from "@/components/CustomTabBar";
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
            tabBar={(props) => <CustomTabBar {...props} />}
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
                            name={focused ? "bxs-home" : "bx-home"}
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
                            name={focused ? "bxs-map" : "bx-map"}
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
                            name={focused ? "bxs-clipboard-detail" : "bx-clipboard-detail"}
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
                            name={focused ? "bxs-group" : "bx-group"}
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
                            name={focused ? "bxs-list-ul" : "bx-list-ul"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </MaterialTopTabs>
    );
}
