import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { Text } from "~/components/ui/text";
import { useRouter } from "expo-router";
import Boxicon from "~/components/Boxicons";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        console.log("Iniciando sesión con:", email);

        router.replace("/(tabs)");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-white"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-center px-8 gap-12">
                    <Text
                        variant="h1"
                        className="text-7xl font-bold text-primary"
                    >
                        Hope
                    </Text>

                    <View className="gap-8">
                        <View className="gap-4">
                            <View
                                style={{ height: 60 }}
                                className="flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3"
                            >
                                <Boxicon
                                    color="#9ca3af"
                                    size={20}
                                    name="bxs-envelope"
                                />
                                <TextInput
                                    placeholder="Correo electrónico"
                                    placeholderTextColor="#9ca3af"
                                    className="flex-1 text-gray-700"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <View
                                style={{ height: 60 }}
                                className="flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3"
                            >
                                <Boxicon
                                    color="#9ca3af"
                                    size={20}
                                    name="bxs-lock"
                                />
                                <TextInput
                                    placeholder="Contraseña"
                                    placeholderTextColor="#9ca3af"
                                    className="flex-1 text-gray-700 text-base"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    className="p-2"
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <Boxicon
                                            color="#9ca3af"
                                            size={24}
                                            name="bxs-eye-closed"
                                        />
                                    ) : (
                                        <Boxicon
                                            color="#9ca3af"
                                            size={24}
                                            name="bxs-eye"
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-[#61b346] py-4 rounded-2xl flex-row justify-center items-center gap-1"
                            onPress={handleLogin}
                        >
                            <Text className="text-white font-bold text-lg">
                                Iniciar Sesión
                            </Text>
                            <Boxicon
                                color="white"
                                size={28}
                                name="bxs-arrow-right-stroke"
                            />
                        </TouchableOpacity>

                        <View className="flex-row justify-center">
                            <Text className="text-gray-500">
                                ¿No tienes cuenta?{" "}
                            </Text>
                            <Text className="text-primary font-bold">
                                Contacta al Administrador
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
