import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
} from "react-native";
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
    MaterialTopTabBarProps,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClipboardList, Home, ListOrdered, MapPin, Users2 } from "lucide-react-native";
import CustomTabBar from "~/components/CustomTabBar";

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
                tabBarActiveTintColor: "#61b346",
            }}
        >
            <MaterialTopTabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <MaterialTopTabs.Screen
                name="visits"
                options={{
                    title: "Visitas",
                    tabBarIcon: ({ color }) => (
                        <MapPin size={24} color={color} />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="interviews"
                options={{
                    title: "Entrevistas",
                    tabBarIcon: ({ color }) => (
                        <ClipboardList size={24} color={color} />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="families"
                options={{
                    title: "Perfiles",
                    tabBarIcon: ({ color }) => (
                        <Users2 size={24} color={color} />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="team"
                options={{
                    title: "Equipo",
                    tabBarIcon: ({ color }) => (
                        <ListOrdered size={24} color={color} />
                    ),
                }}
            />
        </MaterialTopTabs>
    );
}
