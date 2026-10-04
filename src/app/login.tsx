import React, { useState, useEffect } from "react";
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
import { useAuthStore } from "@/store/authStore";
import { authLogin } from "@/services/generated/apiEndpoints";

export default function LoginScreen() {
    const router = useRouter();
    const authStore = useAuthStore();
    const token = useAuthStore((state) => state.token);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (token) {
            router.replace("/(tabs)");
        }
    }, [token, router]);

    if (token) return null;

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Atención", "Por favor ingresa correo y contraseña");
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const response = await authLogin({ email, password });
            
            if (response.token) {
                authStore.setToken(response.token);
                authStore.setUser(response.user);
                router.replace("/(tabs)");
            }
        } catch (error) {
            Alert.alert("Error", "Credenciales incorrectas");
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
                            <View className="flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3 min-h-[60px]">
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

                            <View className="flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3 min-h-[60px]">
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
                            className="bg-primary h-[56px] py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-lg shadow-primary/30"
                            style={{ opacity: isLoading ? 0.7 : 1 }}
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
