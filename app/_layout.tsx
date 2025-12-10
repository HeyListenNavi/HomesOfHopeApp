import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { User2Icon, UserCircle2Icon } from "lucide-react-native";
import "global.css";
import { Text, TextClassContext } from "components/ui/text";

const Layout = () => {
    return (
        <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen
                name="(tabs)"
                options={{
                    header: () => (
                        <View className="flex flex-row items-center justify-between px-3 pt-4 pb-6 bg-white rounded-b-3xl">
                            <Text className="font-bold text-2xl m-0" variant="h1">Hope</Text>
                            <UserCircle2Icon size={28} className="stroke-primary"/>
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
