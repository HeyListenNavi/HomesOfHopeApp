import Boxicon from "@/components/Boxicons";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Text } from "@/components/ui/text";
import React, { useEffect } from "react";
import { View, TextInputProps, TouchableOpacity } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

export interface Parent {
    name: string | null;
    relation: string | null;
    age: string | null;
    birthCountry: string | null;
    birthState: string | null;
    latestSchoolGrade: string | null;
    occupation: string | null;
    weeklySalary: number | null;
    isAwaitingBaby: boolean;
    gestationMonths: string | null;
}

interface AddParentStepProps {
    onSave: (parent: Parent) => void;
    initialValues?: Parent;
}

const AddParentStep = ({ onSave, initialValues }: AddParentStepProps) => {
    const { handleSubmit, getValues, control, watch, setValue } = useForm<Parent>({
        defaultValues: initialValues ?? {},
    });

    const isEditing = !!initialValues;

    const relation = watch("relation");
    const isAwaitingBaby = watch("isAwaitingBaby");

    const onSubmit: SubmitHandler<Parent> = (data) => {
        onSave(data);
    };

    useEffect(() => {
        if (relation !== "madre") {
            setValue("isAwaitingBaby", false);
            setValue("gestationMonths", null);
            return;
        }

        if (!isAwaitingBaby) {
            setValue("gestationMonths", null);
        }
    }, [relation, isAwaitingBaby, setValue]);

    return (
        <View className="p-6 gap-4">
            <Text
                variant="h3"
                className="text-primary font-bold text-center mb-2"
            >
                {isEditing
                    ? `Editar ${getValues("relation")}`
                    : "Nuevo Padre / Tutor"}
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
                        name="relation"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select
                                label="Parentesco"
                                iconName="bxs-group"
                                placeholder="Seleccionar"
                                options={[
                                    { label: "Padre", value: "padre" },
                                    { label: "Madre", value: "madre" },
                                    { label: "Abuelo(a)", value: "abuelo" },
                                    { label: "Tío(a)", value: "tio" },
                                    { label: "Tutor", value: "tutor" },
                                ]}
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                            />
                        )}
                    />
                </View>

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
                                maxLength={3}
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
                name="latestSchoolGrade"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="Nivel de Estudios"
                        placeholder="Último grado cursado"
                        iconName="bxs-education"
                        inSheet
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                    />
                )}
            />

            <Controller
                name="occupation"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Input
                        label="Ocupación Actual"
                        placeholder="¿En qué trabaja?"
                        iconName="bxs-briefcase-alt-2"
                        inSheet
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                    />
                )}
            />

            <Controller
                name="weeklySalary"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <CurrencyInput
                        value={field.value}
                        onChangeValue={field.onChange}
                        prefix="$"
                        delimiter=","
                        precision={0}
                        minValue={0}
                        renderTextInput={(props: TextInputProps) => (
                            <Input
                                label="Ingreso Semanal"
                                placeholder="Monto aproximado"
                                iconName="bxs-dollar-circle"
                                keyboardType="number-pad"
                                maxLength={15}
                                inSheet
                                {...props}
                            />
                        )}
                    />
                )}
            />

            {relation === "madre" && (
                <Controller
                    name="isAwaitingBaby"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="tempParentIsAwaitingBaby"
                            label="¿Está embarazada?"
                            placeholder="Marcar si está esperando bebé"
                            iconName="bxs-child"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            )}

            {isAwaitingBaby && (
                <Controller
                    name="gestationMonths"
                    rules={
                        getValues("isAwaitingBaby") === true
                            ? { required: true }
                            : {}
                    }
                    control={control}
                    render={({ field }) => (
                        <Input
                            label="Meses de gestación"
                            placeholder="Meses"
                            iconName="bxs-hourglass"
                            keyboardType="number-pad"
                            maxLength={1}
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

export default AddParentStep;
