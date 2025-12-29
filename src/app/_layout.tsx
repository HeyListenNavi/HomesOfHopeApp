import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import "global.css";
import { Text } from "@/components/ui/text";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import Boxicon from "@/components/Boxicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
    useFonts,
    Inter_400Regular,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

SplashScreen.preventAutoHideAsync();

const Layout = () => {
    const insets = useSafeAreaInsets();

    const [fontsLoaded] = useFonts({
        Boxicons: require("@/assets/fonts/boxicons.ttf"),
        BrandBoxicons: require("@/assets/fonts/boxicons-brands.ttf"),
        "Inter-Regular": Inter_400Regular,
        "Inter-Bold": Inter_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <KeyboardProvider>
                    <Stack
                        screenOptions={{
                            headerShadowVisible: false,
                            contentStyle: { backgroundColor: "#f3f4f6" },
                        }}
                    >
                        <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="login"
                            options={{
                                headerShown: false,
                                animation: "fade",
                            }}
                        />

                        <Stack.Screen
                            name="(tabs)"
                            options={{
                                header: () => (
                                    <View className="bg-gray-100">
                                        <View
                                            className="flex flex-row items-center justify-between px-6 pb-6 bg-white rounded-b-3xl"
                                            style={{ paddingTop: insets.top }}
                                        >
                                            <Text
                                                className="font-bold text-primary text-2xl m-0"
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
                            name="visit-detail/[id]"
                            options={{
                                headerTitle: "Visita",
                                headerShadowVisible: false,
                                headerBackTitle: "Atras",
                            }}
                        />

                        <Stack.Screen
                            name="interview-detail/[id]"
                            options={{
                                headerTitle: "Entrevista",
                                headerShadowVisible: false,
                                headerBackTitle: "Atras",
                            }}
                        />

                        <Stack.Screen
                            name="new-family-profile/[id]"
                            options={{
                                headerTitle: "Nuevo Perfil",
                                headerTitleAlign: "center",
                                headerShadowVisible: false,
                                headerBackTitle: "Atras",
                            }}
                        />

                        <Stack.Screen
                            name="family-profile/[id]"
                            options={{
                                headerTitle: "Perfil",
                                headerShadowVisible: false,
                                headerBackTitle: "Atras",
                            }}
                        />
                    </Stack>
                </KeyboardProvider>
            </BottomSheetModalProvider>
            <PortalHost />
        </GestureHandlerRootView>
    );
};

export default Layout;
