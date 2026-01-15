import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import Boxicon from "@/components/Boxicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";

export default function LoginScreen() {
    const router = useRouter();
    const authStore = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Atención", "Por favor ingresa correo y contraseña");
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const response = await api.post("/login", {
                email,
                password,
            });

            const token = response.data.access_token;

            if (token) {
                authStore.setToken(token);
                router.replace("/(tabs)");
            }
        } catch (error) {
            const err = error as AxiosError;

            if (!err.response) {
                Alert.alert("Sin conexión", "Revisa tu internet");
                return;
            }

            if (err.response.status === 401 || err.response.status === 422) {
                Alert.alert("Acceso denegado", "Credenciales incorrectas");
                return;
            }

            Alert.alert("Error", "Algo salió mal. Intenta de nuevo más tarde");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView
            contentContainerClassName="flex-1 bg-white"
            showsVerticalScrollIndicator={false}
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
                                    editable={!isLoading}
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
                                    editable={!isLoading}
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
                            className={`bg-[#61b346] h-[56px] py-4 rounded-2xl flex-row justify-center items-center gap-1 ${
                                isLoading ? "opacity-70" : ""
                            }`}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white font-bold text-lg">
                                        Iniciar Sesión
                                    </Text>
                                    <Boxicon
                                        color="white"
                                        size={28}
                                        name="bxs-arrow-right-stroke"
                                    />
                                </>
                            )}
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
        </KeyboardAwareScrollView>
    );
}
