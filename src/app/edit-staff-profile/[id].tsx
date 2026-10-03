import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ToastAndroid,
    Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Input from "@/components/Input";

import FluentEmoji from "@/components/FluentEmoji";
import Boxicon from "@/components/Boxicons";
import InfoRow from "@/components/InfoRow";
import { formatDate } from "@/lib/utils";
import {
    useUserUpdate,
    useUserShow,
    getUserShowQueryKey,
} from "@/services/generated/apiEndpoints";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Permission } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";



type FormValues = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function EditStaffProfilePage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const queryClient = useQueryClient();

    const userId = Number(id);

    const { can } = usePermissions();
    const allowed = usePermissionGuard(Permission.userUpdate);

    const { data: existingUser, isPending: isUserPending } = useUserShow(userId, {
        query: {
            enabled: !isNaN(userId) && userId > 0 && can(Permission.userUpdate),
        },
    });



    const updateMutation = useUserUpdate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormValues>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    const passwordValue = watch("password");

    useEffect(() => {
        if (existingUser) {
            reset({
                name: existingUser.name || "",
                email: existingUser.email || "",
                password: "",
                password_confirmation: "",
            });
        }
    }, [existingUser, reset]);

    const onSubmit = async (data: FormValues) => {
        try {
            await updateMutation.mutateAsync({
                user: userId,
                data: {
                    name: data.name.trim(),
                    email: data.email.trim(),
                    ...(data.password ? { password: data.password } : {}),
                },
            });

            queryClient.invalidateQueries({ queryKey: getUserShowQueryKey(userId) });
            queryClient.invalidateQueries({ queryKey: ["/users"] });

            ToastAndroid.show("Staff actualizado correctamente 🎉", ToastAndroid.SHORT);

            router.back();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg =
                errorData?.errors?.email?.[0] ||
                errorData?.errors?.password?.[0] ||
                errorData?.errors?.name?.[0] ||
                errorData?.message ||
                "Ocurrió un error al actualizar el perfil de staff.";
            Alert.alert("Error al Guardar", errorMsg);
        }
    };

    if (!allowed) return null;

    if (isUserPending && !existingUser) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center">
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    const canSave = isDirty;

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
                            Por favor revisa los campos señalados para continuar.
                        </Text>
                    </View>
                </View>
            )}

            {}
            <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                <View className="flex-row items-center gap-3">
                    <FluentEmoji emoji="✏️" className="text-2xl" />
                    <Text className="font-bold text-gray-800 text-xl">
                        Información General
                    </Text>
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
                    <FluentEmoji emoji="🔒" className="text-2xl" />
                    <View>
                        <Text className="font-bold text-gray-800 text-lg">
                            Cambiar Contraseña
                        </Text>
                        <Text className="text-gray-500 text-xs font-medium">
                            Opcional — déjalo vacío para no cambiarla.
                        </Text>
                    </View>
                </View>

                <View className="gap-5">
                    <Controller
                        control={control}
                        name="password"
                        rules={{
                            minLength: {
                                value: 8,
                                message: "La nueva contraseña debe tener al menos 8 caracteres.",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Nueva Contraseña"
                                placeholder="Mínimo 8 caracteres"
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
                            validate: (val) =>
                                !passwordValue || val === passwordValue || "Las contraseñas no coinciden.",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Confirmar Nueva Contraseña"
                                placeholder="Repite la nueva contraseña"
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
            {existingUser && (
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-4">
                    <View className="flex-row items-center gap-2">
                        <FluentEmoji emoji="ℹ️" className="text-xl" />
                        <Text className="font-bold text-gray-800 text-base">
                            Registro del Sistema
                        </Text>
                    </View>

                    <View className="gap-2">
                        <InfoRow
                            label="Fecha de Alta"
                            value={
                                existingUser.created_at
                                    ? formatDate(existingUser.created_at)
                                    : "No registrada"
                            }
                        />
                    </View>
                </View>
            )}

            {}
            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || isUserPending || !canSave}
                activeOpacity={0.85}
                className={`w-full h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg mb-6 ${
                    canSave
                        ? "bg-primary shadow-primary/30 active:opacity-90"
                        : "bg-gray-200 shadow-transparent"
                }`}
                accessibilityRole="button"
                accessibilityLabel="Guardar Cambios"
            >
                {isSubmitting ? (
                    <ActivityIndicator color={canSave ? "#ffffff" : "#9ca3af"} size="small" />
                ) : (
                    <>
                        <Text className={`font-black text-lg ${canSave ? "text-white" : "text-gray-400"}`}>
                            Guardar Cambios
                        </Text>
                        <Boxicon
                            name="bxs-save"
                            size={22}
                            color={canSave ? "#ffffff" : "#9ca3af"}
                        />
                    </>
                )}
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
}
