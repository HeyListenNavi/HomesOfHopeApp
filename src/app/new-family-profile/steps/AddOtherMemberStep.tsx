import Input from "@/components/Input";
import { Text } from "@/components/ui/text";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

export interface OtherMember {
    name: string | null;
    age: string | null;
    relation: string | null;
}
interface AddOtherMemberProps {
    onSave: (otherMember: OtherMember) => void;
    initialValues?: OtherMember;
}

const AddOtherMemberStep = ({ onSave, initialValues }: AddOtherMemberProps) => {
    const { handleSubmit, getValues, control, watch, setValue } =
        useForm<OtherMember>({
            defaultValues: initialValues ?? {},
        });

    const isEditing = !!initialValues;

    const onSubmit: SubmitHandler<OtherMember> = (data) => {
        onSave(data);
    };

    return (
        <View className="p-6 gap-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">
                {isEditing ? "Editar Persona" : "Nueva Persona"}
            </Text>

            <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="Nombre Completo"
                        placeholder="Nombre de la persona"
                        inSheet
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                        iconName="bxs-user"
                    />
                )}
            />

            <View className="flex-row gap-4">
                <View className="flex-1">
                    <Controller
                        name="age"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Input
                                label="Edad"
                                placeholder="Años"
                                keyboardType="number-pad"
                                maxLength={3}
                                inSheet
                                value={field.value ?? ""}
                                onChangeText={field.onChange}
                                iconName="bxs-calendar"
                            />
                        )}
                    />
                </View>
                <View className="flex-1">
                    <Controller
                        name="relation"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Input
                                label="Parentesco"
                                placeholder="Ej. Tío, Abuelo"
                                inSheet
                                value={field.value ?? ""}
                                onChangeText={field.onChange}
                                iconName="bxs-group"
                            />
                        )}
                    />
                </View>
            </View>

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                className="bg-primary p-4 rounded-xl"
            >
                <Text className="text-white text-center font-bold">
                    Guardar
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddOtherMemberStep;
