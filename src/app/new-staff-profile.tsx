import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ToastAndroid,
    Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Input from "@/components/Input";
import FluentEmoji from "@/components/FluentEmoji";
import Boxicon from "@/components/Boxicons";
import { useUserStore } from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";



type FormValues = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function NewStaffProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const storeMutation = useUserStore();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    const passwordValue = watch("password");

    const onSubmit = async (data: FormValues) => {
        try {
            await storeMutation.mutateAsync({
                data: {
                    name: data.name.trim(),
                    email: data.email.trim(),
                    password: data.password,
                },
            });

            queryClient.invalidateQueries({ queryKey: ["/users"] });

            if (Platform.OS === "android") {
                ToastAndroid.show("Staff creado correctamente 🎉", ToastAndroid.SHORT);
            }

            router.back();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg =
                errorData?.errors?.email?.[0] ||
                errorData?.errors?.password?.[0] ||
                errorData?.errors?.name?.[0] ||
                errorData?.message ||
                "Ocurrió un error al crear el perfil de staff.";
            Alert.alert("Error al Guardar", errorMsg);
        }
    };

    return (
        <KeyboardAwareScrollView
            contentContainerClassName="p-6 gap-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className="flex-1 bg-gray-100"
        >
            {}
            {Object.keys(errors).length > 0 && (
                <View className="bg-red-50 border border-red-200 p-4 rounded-2xl flex-row items-start gap-3 shadow-sm">
                    <FluentEmoji emoji="⚠️" className="text-2xl mt-0.5 shrink-0" />
                    <View className="flex-1">
                        <Text className="text-red-800 font-extrabold text-base">
                            Hay campos obligatorios pendientes
                        </Text>
                        <Text className="text-red-700 text-sm mt-0.5 leading-snug">
                            Por favor completa todos los campos para continuar.
                        </Text>
                    </View>
                </View>
            )}

            {}
            <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                <View className="flex-row items-center gap-3">
                    <FluentEmoji emoji="👤" className="text-3xl" />
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800 text-xl">
                            Información del Staff
                        </Text>
                        <Text className="text-gray-500 text-sm font-medium">
                            Datos personales y asignación de rol.
                        </Text>
                    </View>
                </View>

                <View className="gap-5">
                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: "El nombre completo es obligatorio." }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Nombre Completo"
                                placeholder="Ej. María Guadalupe López"
                                required
                                iconName="bxs-user"
                                value={value}
                                onChangeText={onChange}
                                error={errors.name?.message}
                            />
                        )}
                    />


                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: "El correo electrónico es obligatorio.",
                            pattern: {
                                value: /^\S+@\S+\.\S+$/i,
                                message: "Ingresa un correo electrónico válido.",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Correo Electrónico"
                                placeholder="staff@hope.org"
                                required
                                iconName="bxs-envelope"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                            />
                        )}
                    />
                </View>
            </View>

            {}
            <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                <View className="flex-row items-center gap-3">
                    <FluentEmoji emoji="🔒" className="text-3xl" />
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800 text-xl">
                            Contraseña Inicial
                        </Text>
                        <Text className="text-gray-500 text-sm font-medium">
                            Contraseña para el primer ingreso del usuario.
                        </Text>
                    </View>
                </View>

                <View className="gap-5">
                    <Controller
                        control={control}
                        name="password"
                        rules={{
                            required: "La contraseña es obligatoria.",
                            minLength: {
                                value: 8,
                                message: "La contraseña debe tener al menos 8 caracteres.",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Contraseña"
                                placeholder="Mínimo 8 caracteres"
                                required
                                iconName="bxs-lock"
                                secureTextEntry={!showPassword}
                                value={value}
                                onChangeText={onChange}
                                error={errors.password?.message}
                                suffix={
                                    <TouchableOpacity
                                        onPress={() => setShowPassword((p) => !p)}
                                        className="p-2 -mr-1 items-center justify-center active:opacity-70"
                                        accessibilityRole="button"
                                        accessibilityLabel={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        <Boxicon
                                            name={showPassword ? "bxs-eye-slash" : "bxs-eye"}
                                            size={22}
                                            color="#9ca3af"
                                        />
                                    </TouchableOpacity>
                                }
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password_confirmation"
                        rules={{
                            required: "La confirmación de contraseña es obligatoria.",
                            validate: (val) =>
                                val === passwordValue || "Las contraseñas no coinciden.",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Confirmar Contraseña"
                                placeholder="Repite la contraseña"
                                required
                                iconName="bxs-lock"
                                secureTextEntry={!showConfirmPassword}
                                value={value}
                                onChangeText={onChange}
                                error={errors.password_confirmation?.message}
                                suffix={
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword((p) => !p)}
                                        className="p-2 -mr-1 items-center justify-center active:opacity-70"
                                        accessibilityRole="button"
                                        accessibilityLabel={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        <Boxicon
                                            name={showConfirmPassword ? "bxs-eye-slash" : "bxs-eye"}
                                            size={22}
                                            color="#9ca3af"
                                        />
                                    </TouchableOpacity>
                                }
                            />
                        )}
                    />
                </View>
            </View>

            {}
            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className="w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg bg-primary shadow-primary/30 active:opacity-90 mb-6"
                accessibilityRole="button"
                accessibilityLabel="Crear Staff"
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                    <>
                        <Text className="font-black text-lg text-white">Crear Staff</Text>
                        <Boxicon name="bxs-user-plus" size={22} color="#ffffff" />
                    </>
                )}
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
}
