import Boxicon from "@/components/Boxicons";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export interface StaffForm {
    name: string | null;
    role: string | null;
    phoneNumber: string | null;
    email: string | null;
    isActive: boolean;
}

interface CreateStaffViewProps {
    initialValues?: StaffForm;
}

const ROLE_OPTIONS = [
    { label: "Trabajador Social", value: "social_worker" },
    { label: "Entrevistador", value: "interviewer" },
    { label: "Administrador", value: "admin" },
    { label: "Voluntario", value: "volunteer" },
];

const Page = ({ initialValues }: CreateStaffViewProps) => {
    const router = useRouter();
    const { control, handleSubmit } = useForm<StaffForm>({
        defaultValues: initialValues ?? {
            name: null,
            role: null,
            phoneNumber: null,
            email: null,
            isActive: true,
        },
    });

    const isEditing = !!initialValues;

    const onSubmit: SubmitHandler<StaffForm> = (data) => {
        console.log(data);
        router.back();
    };

    const maskPhoneNumber = (text: string) => {
        const cleaned = ("" + text).replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6)
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
            6,
            10
        )}`;
    };

    return (
        <KeyboardAwareScrollView
            contentContainerClassName="p-6 gap-4 bg-gray-50"
            showsVerticalScrollIndicator={false}
        >
            <View className="items-center gap-3 mb-2">
                <Avatar className="h-24 w-24" alt={""}>
                    <AvatarImage source={{ uri: undefined }} />
                    <AvatarFallback>
                        <Boxicon name="bxs-user" size={42} color="#9ca3af" />
                    </AvatarFallback>
                </Avatar>

                <Text
                    variant="h3"
                    className="text-primary font-bold text-center"
                >
                    {isEditing ? "Editar Staff" : "Nuevo Staff"}
                </Text>
            </View>

            <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="Nombre Completo"
                        placeholder="Nombre del integrante"
                        iconName="bxs-user"
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                    />
                )}
            />

            <Controller
                name="role"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Select
                        label="Rol"
                        placeholder="Selecciona un rol"
                        iconName="bxs-user-id-card"
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        options={ROLE_OPTIONS}
                    />
                )}
            />

            <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="Número de teléfono"
                        placeholder="Número de contacto"
                        iconName="bxs-phone"
                        keyboardType="phone-pad"
                        maxLength={12}
                        prefix="+52"
                        value={field.value ?? ""}
                        onChangeText={(text) => {
                            const masked = maskPhoneNumber(text);
                            field.onChange(masked);
                        }}
                    />
                )}
            />

            <Controller
                name="email"
                control={control}
                rules={{
                    required: true,
                    pattern: /^\S+@\S+$/i,
                }}
                render={({ field }) => (
                    <Input
                        label="Correo Electrónico"
                        placeholder="correo@ejemplo.com"
                        iconName="bxs-envelope"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                    />
                )}
            />

            <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        label="Staff activo"
                        placeholder="¿Actualmente activo?"
                        iconName="bxs-check-circle"
                        checked={field.value ?? true}
                        onCheckedChange={field.onChange}
                    />
                )}
            />

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                className="bg-primary p-4 rounded-xl mt-4 flex-row justify-center items-center gap-2"
            >
                <Boxicon name="bxs-save" size={20} color="white" />
                <Text className="text-white font-bold text-lg">
                    {isEditing ? "Guardar Cambios" : "Crear Staff"}
                </Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
};

export default Page;
