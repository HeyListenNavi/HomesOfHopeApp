import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import "~/global.css";
import { Text } from "@/components/ui/text";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import Boxicon from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
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
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

SplashScreen.preventAutoHideAsync();

const Layout = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const userName = useAuthStore((state) => state.user?.name);

    const [fontsLoaded] = useFonts({
        Boxicons: require("@/assets/fonts/boxicons.ttf"),
        BrandBoxicons: require("@/assets/fonts/boxicons-brands.ttf"),
        "Inter-Regular": Inter_400Regular,
        "Inter-Bold": Inter_700Bold,
        "FluentEmoji": require("@/assets/fonts/FluentEmoji.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider statusBarTranslucent={true} navigationBarTranslucent={true} preserveEdgeToEdge={true}>
                    <BottomSheetModalProvider>
                        <Stack
                            screenOptions={{
                                headerShadowVisible: false,
                                contentStyle: { backgroundColor: "#f3f4f6" },
                            }}
                        >
                            <Stack.Screen name="index" options={{ headerShown: false }} />

                            <Stack.Screen
                                name="login"
                                options={{
                                    headerShown: false,
                                    animation: "fade",
                                }}
                            />

                            <Stack.Screen
                                name="profile"
                                options={{
                                    headerTitle: "Perfil",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Inicio",
                                }}
                            />

                            <Stack.Screen
                                name="(tabs)"
                                options={{
                                    header: () => (
                                        <View
                                            className="bg-white flex-row items-center justify-between rounded-b-[32px] shadow-xl shadow-black/10"
                                            style={{
                                                paddingTop: insets.top + 16,
                                                paddingBottom: 24,
                                                paddingHorizontal: 24,
                                                zIndex: 100,
                                                elevation: 20,
                                            }}
                                        >
                                            <View className="flex-col gap-0 items-start">
                                                <Text className="font-extrabold text-primary text-4xl">
                                                    Hope
                                                </Text>
                                                <View className="flex-row items-center gap-1.5 mt-1">
                                                    <Text className="text-gray-500 font-medium text-base">
                                                        Hola, {userName?.split(" ")[0] ?? "Usuario"}
                                                    </Text>
                                                    <FluentEmoji emoji="👋" className="text-lg" />
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => router.push("/profile")}
                                                className="bg-gray-50 p-1.5 rounded-full"
                                            >
                                                <Boxicon name="bxs-user-circle" size={42} color="#61b346" />
                                            </TouchableOpacity>
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
                                name="visit-close/[id]"
                                options={{
                                    headerTitle: "Finalizar Visita",
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
                                name="new-family-profile/index"
                                options={{
                                    headerTitle: "Nueva Familia",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="edit-family-profile/[id]"
                                options={{
                                    headerTitle: "Editar Familia",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="family-profile/[id]"
                                options={{
                                    headerTitle: "Perfil Familiar",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="new-note/[id]"
                                options={{
                                    headerTitle: "Nueva Nota",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="new-document/[id]"
                                options={{
                                    headerTitle: "Nuevo Documento",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="new-testimony/[id]"
                                options={{
                                    headerTitle: "Nuevo Testimonio",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="new-staff-profile"
                                options={{
                                    headerTitle: "Nuevo Staff",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="edit-staff-profile/[id]"
                                options={{
                                    headerTitle: "Editar Staff",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />

                            <Stack.Screen
                                name="staff-profile/[id]"
                                options={{
                                    headerTitle: "Staff",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />
                            <Stack.Screen
                                name="family-member/[id]"
                                options={{
                                    headerTitle: "Familiar",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />
                            <Stack.Screen
                                name="edit-family-member/[id]"
                                options={{
                                    headerTitle: "Editar Familiar",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />
                            <Stack.Screen
                                name="new-family-member/[id]"
                                options={{
                                    headerTitle: "Nuevo Familiar",
                                    headerTitleAlign: "center",
                                    headerShadowVisible: false,
                                    headerBackTitle: "Atras",
                                }}
                            />
                        </Stack>
                        <PortalHost />
                    </BottomSheetModalProvider>
                </KeyboardProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
};

export default Layout;
