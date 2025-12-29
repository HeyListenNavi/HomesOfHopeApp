import Boxicon from "@/components/Boxicons";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Text } from "@/components/ui/text";
import React, { useEffect } from "react";
import { View, TextInputProps, TouchableOpacity } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

export interface Child {
    name: string | null;
    age: string | null;
    birthdate: string | null;
    birthCountry: string | null;
    birthState: string | null;
    goesToSchool: boolean;
    schoolGrade: string | null;
    hasSpecialNeed: boolean;
    specialNeed: string | null;
}

interface AddChildStepProps {
    onSave: (child: Child) => void;
    initialValues?: Child;
}

const AddChildStep = ({ onSave, initialValues }: AddChildStepProps) => {
    const { handleSubmit, getValues, control, watch, setValue } =
        useForm<Child>({
            defaultValues: initialValues ?? {},
        });

    const isEditing = !!initialValues;

    const goesToSchool = watch("goesToSchool");
    const hasSpecialNeed = watch("hasSpecialNeed");

    const onSubmit: SubmitHandler<Child> = (data) => {
        onSave(data);
    };

    useEffect(() => {
        if (!goesToSchool) {
            setValue("schoolGrade", null);
        }

        if (!hasSpecialNeed) {
            setValue("specialNeed", null);
        }
    }, [goesToSchool, hasSpecialNeed, setValue]);

    return (
        <View className="p-6 gap-4">
            <Text
                variant="h3"
                className="text-primary font-bold text-center mb-2"
            >
                {isEditing ? "Editar Hijo" : "Nuevo Hijo"}
            </Text>

            <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="Nombre Completo"
                        placeholder="Escribe el nombre completo"
                        iconName="bxs-user"
                        inSheet
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
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
                                iconName="bxs-calendar"
                                keyboardType="number-pad"
                                maxLength={2}
                                inSheet
                                value={field.value ?? ""}
                                onChangeText={field.onChange}
                            />
                        )}
                    />
                </View>

                <View className="flex-1">
                    <Controller
                        name="birthdate"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Input
                                label="Fecha de Nacimiento"
                                placeholder="DD/MM/AAAA"
                                iconName="bxs-calendar"
                                inSheet
                                value={field.value ?? ""}
                                onChangeText={field.onChange}
                            />
                        )}
                    />
                </View>
            </View>

            <Controller
                name="birthCountry"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="País de Origen"
                        placeholder="Ej. México"
                        iconName="bxs-flag-alt"
                        inSheet
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                    />
                )}
            />

            <Controller
                name="birthState"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="Estado / Provincia"
                        placeholder="¿De qué estado provienen?"
                        iconName="bxs-location"
                        inSheet
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                    />
                )}
            />

            <Controller
                name="goesToSchool"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        label="Asiste a la escuela"
                        placeholder="¿Actualmente estudia?"
                        iconName="bxs-school"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                    />
                )}
            />

            {goesToSchool && (
                <Controller
                    name="schoolGrade"
                    control={control}
                    rules={getValues("goesToSchool") ? { required: true } : {}}
                    render={({ field }) => (
                        <Input
                            label="Grado Escolar"
                            placeholder="Ej. Tercero de Primaria"
                            iconName="bxs-book"
                            inSheet
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                        />
                    )}
                />
            )}

            <Controller
                name="hasSpecialNeed"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        label="Necesidad especial"
                        placeholder="¿Tiene alguna necesidad especial?"
                        iconName="bxs-heart"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                    />
                )}
            />

            {hasSpecialNeed && (
                <Controller
                    name="specialNeed"
                    control={control}
                    rules={
                        getValues("hasSpecialNeed") ? { required: true } : {}
                    }
                    render={({ field }) => (
                        <Input
                            label="¿Cuál necesidad?"
                            placeholder="Describa la necesidad especial"
                            iconName="bxs-info-circle"
                            inSheet
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                        />
                    )}
                />
            )}

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                className="bg-primary p-4 rounded-xl mt-4 flex-row justify-center items-center gap-2"
            >
                <Boxicon name="bxs-save" size={20} color="white" />
                <Text className="text-white font-bold text-lg">Guardar</Text>
            </TouchableOpacity>

            <View className="h-10" />
        </View>
    );
};

export default AddChildStep;
