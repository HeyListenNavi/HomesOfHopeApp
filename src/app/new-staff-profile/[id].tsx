import Boxicon from "@/components/Boxicons";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import React from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator, ToastAndroid } from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useCreateUser } from "@/hooks/useUsers";

export interface StaffForm {
    name: string | null;
    role: string | null;
    email: string | null;
    password: string | null;
}

const ROLE_OPTIONS = [
    { label: "Trabajador Social", value: "Trabajador Social" },
    { label: "Entrevistador", value: "Entrevistador" },
    { label: "Administrador", value: "Administrador" },
    { label: "Voluntario", value: "Voluntario" },
];

const Page = () => {
    const router = useRouter();
    const { mutateAsync: createUser } = useCreateUser();

    const { control, handleSubmit, formState: { isSubmitting } } = useForm<StaffForm>({
        defaultValues: {
            name: null,
            role: null,
            email: null,
            password: null,
        },
    });

    const onSubmit: SubmitHandler<StaffForm> = async (data) => {
        if (!data.name || !data.email || !data.password) {
            Alert.alert("Error", "Nombre, correo y contraseña son obligatorios.");
            return;
        }

        if (data.password.length < 8) {
            Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        try {
            await createUser({
                name: data.name,
                email: data.email,
                password: data.password,
            });
            ToastAndroid.show("Staff creado correctamente", ToastAndroid.SHORT);
            router.back();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ??
                "Hubo un problema al crear el usuario.";
            Alert.alert("Error", message);
        }
    };

    return (
        <KeyboardAwareScrollView
            contentContainerClassName="p-6 gap-4 bg-gray-50"
            showsVerticalScrollIndicator={false}
        >
            <View className="items-center gap-3 mb-2">
                <Avatar className="h-24 w-24" alt={""}>
                    <AvatarFallback>
                        <Boxicon name="bxs-user" size={42} color="#9ca3af" />
                    </AvatarFallback>
                </Avatar>

                <Text
                    variant="h3"
                    className="text-primary font-bold text-center"
                >
                    Nuevo Staff
                </Text>
            </View>

            <Controller
                name="name"
                control={control}
                rules={{ required: "El nombre es obligatorio" }}
                render={({ field, fieldState }) => (
                    <View className="gap-1">
                        <Input
                            label="Nombre Completo"
                            placeholder="Nombre del integrante"
                            iconName="bxs-user"
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                        />
                        {fieldState.error && (
                            <Text className="text-red-500 text-sm ml-1">
                                {fieldState.error.message}
                            </Text>
                        )}
                    </View>
                )}
            />

            <Controller
                name="role"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Rol (opcional)"
                        placeholder="Selecciona un rol"
                        iconName="bxs-user-id-card"
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        options={ROLE_OPTIONS}
                    />
                )}
            />

            <Controller
                name="email"
                control={control}
                rules={{
                    required: "El correo es obligatorio",
                    pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Correo inválido",
                    },
                }}
                render={({ field, fieldState }) => (
                    <View className="gap-1">
                        <Input
                            label="Correo Electrónico"
                            placeholder="correo@ejemplo.com"
                            iconName="bxs-envelope"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                        />
                        {fieldState.error && (
                            <Text className="text-red-500 text-sm ml-1">
                                {fieldState.error.message}
                            </Text>
                        )}
                    </View>
                )}
            />

            <Controller
                name="password"
                control={control}
                rules={{
                    required: "La contraseña es obligatoria",
                    minLength: {
                        value: 8,
                        message: "Mínimo 8 caracteres",
                    },
                }}
                render={({ field, fieldState }) => (
                    <View className="gap-1">
                        <Input
                            label="Contraseña"
                            placeholder="Mínimo 8 caracteres"
                            iconName="bxs-lock"
                            secureTextEntry
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                        />
                        {fieldState.error && (
                            <Text className="text-red-500 text-sm ml-1">
                                {fieldState.error.message}
                            </Text>
                        )}
                    </View>
                )}
            />

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={`bg-primary p-4 rounded-xl mt-4 flex-row justify-center items-center gap-2 ${isSubmitting ? "opacity-70" : ""}`}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Boxicon name="bxs-save" size={20} color="white" />
                )}
                <Text className="text-white font-bold text-lg">
                    {isSubmitting ? "Guardando..." : "Crear Staff"}
                </Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
};

export default Page;
