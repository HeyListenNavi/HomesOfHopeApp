import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { UserCircle2 } from "lucide-react-native";
import "global.css"

const Layout = () => {
    return (
        <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerLeft: () => <Text className="mx-2">Hope</Text>,
                    headerRight: () => <UserCircle2 className="mx-2" size={28} />,
                    headerTitle: () => null,
                }}
                
            />
            <Stack.Screen
                name="details"
                options={{
                    headerTitle: "Inicio",
                }}
            />
        </Stack>
    );
};

export default Layout;
