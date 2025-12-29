import Boxicon from "@/components/Boxicons";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { View, TextInputProps, TouchableOpacity } from "react-native";
import CurrencyInput from "react-native-currency-input";

const initialParentState: Parent = {
    name: null,
    relation: null,
    age: null,
    birthCountry: null,
    birthState: null,
    schooling: null,
    occupation: null,
    weeklySalary: null,
    isAwaitingBaby: false,
    gestationMonths: null,
};

export interface Parent {
    name: string | null;
    relation: string | null;
    age: string | null;
    birthCountry: string | null;
    birthState: string | null;
    schooling: string | null;
    occupation: string | null;
    weeklySalary: number | null;
    isAwaitingBaby: boolean;
    gestationMonths: string | null;
}

interface AddParentProps {
    onSave: (parent: Parent) => void;
    initialValues?: Parent;
}

const AddParentStep = ({ onSave, initialValues }: AddParentProps) => {
    const [form, setForm] = useState<Parent>(initialParentState);
    const isEditing = !!initialValues;

    useEffect(() => {
        if (initialValues) {
            setForm(initialValues);
        } else {
            setForm(initialParentState);
        }
    }, [initialValues]);

    const handleChange = (key: keyof Parent, value: any) => {
        console.log({ [key]: value });
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(form);
        setForm(initialParentState);
    };

    return (
        <View className="p-6 gap-4">
            <Text
                variant="h3"
                className="text-primary font-bold text-center mb-2"
            >
                {isEditing ? `Editar ${form.relation}` : "Nuevo Padre / Tutor"}
            </Text>

            <Input
                label="Nombre Completo"
                placeholder="Escribe el nombre completo"
                iconName="bxs-user"
                inSheet
                value={form.name ?? ""}
                onChangeText={(t) => handleChange("name", t)}
            />

            <View className="flex-row gap-4">
                <View className="flex-1">
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
                        value={form.relation ?? ""}
                        onValueChange={(t) => handleChange("relation", t)}
                    />
                </View>

                <View className="flex-1">
                    <Input
                        label="Edad"
                        placeholder="Años"
                        iconName="bxs-birthday-cake"
                        keyboardType="number-pad"
                        maxLength={3}
                        inSheet
                        value={form.age ?? ""}
                        onChangeText={(t) => handleChange("age", t)}
                    />
                </View>
            </View>

            <Input
                label="País de Origen"
                placeholder="Ej. México"
                iconName="bxs-flag-alt"
                inSheet
                value={form.birthCountry ?? ""}
                onChangeText={(t) => handleChange("birthCountry", t)}
            />

            <Input
                label="Estado / Provincia"
                placeholder="¿De qué estado provienen?"
                iconName="bxs-location"
                inSheet
                value={form.birthState ?? ""}
                onChangeText={(t) => handleChange("birthState", t)}
            />

            <Input
                label="Nivel de Estudios"
                placeholder="Último grado cursado"
                iconName="bxs-education"
                inSheet
                value={form.schooling ?? ""}
                onChangeText={(t) => handleChange("schooling", t)}
            />

            <Input
                label="Ocupación Actual"
                placeholder="¿En qué trabaja?"
                iconName="bxs-briefcase-alt-2"
                inSheet
                value={form.occupation ?? ""}
                onChangeText={(t) => handleChange("occupation", t)}
            />

            <CurrencyInput
                value={form.weeklySalary}
                onChangeValue={(v) => handleChange("weeklySalary", v)}
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

            {form.relation === "madre" && (
                <Checkbox
                    id="tempParentIsAwaitingBaby"
                    label="¿Está embarazada?"
                    placeholder="Marcar si está esperando bebé"
                    iconName="bxs-child"
                    checked={form.isAwaitingBaby}
                    onCheckedChange={(t: boolean) =>
                        handleChange("isAwaitingBaby", t)
                    }
                />
            )}

            {form.isAwaitingBaby && (
                <Input
                    label="Meses de gestación"
                    placeholder="Meses"
                    iconName="bxs-hourglass"
                    maxLength={1}
                    inSheet
                    value={form.gestationMonths ?? ""}
                    onChangeText={(t) => handleChange("gestationMonths", t)}
                />
            )}

            <TouchableOpacity
                onPress={handleSave}
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
