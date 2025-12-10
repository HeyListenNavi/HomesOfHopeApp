import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import "global.css";
import { Text, TextClassContext } from "components/ui/text";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import Boxicon from "~/components/Boxicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const Layout = () => {
    const insets = useSafeAreaInsets();

    const [fontsLoaded] = useFonts({
        Boxicons: require("../assets/fonts/boxicons.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                contentStyle: { backgroundColor: "#f2f2f2" },
            }}
        >
            <Stack.Screen
                name="(tabs)"
                options={{
                    header: () => (
                        <View className="bg-gray-100">
                            <View
                                className="flex flex-row items-center justify-between px-6 pb-6 bg-white rounded-b-3xl overflow-hidden shadow-md elevation-5"
                                style={{ paddingTop: insets.top }}
                            >
                                <Text
                                    className="font-bold text-2xl m-0"
                                    variant="h1"
                                >
                                    Hope
                                </Text>
                                <Boxicon
                                    name="bxs-user-circle"
                                    size={38}
                                    color="#61b346"
                                />
                            </View>
                        </View>
                    ),
                }}
            />

            <Stack.Screen
                name="details"
                options={{
                    headerTitle: "Detalles",
                }}
            />
        </Stack>
    );
};

export default Layout;
