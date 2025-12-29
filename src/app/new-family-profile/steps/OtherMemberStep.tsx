import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";
import Input from "@/components/Input";
import { View, TouchableOpacity } from "react-native";
import StepContainer from "./StepContainer";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState, useEffect } from "react";
import ReusableBottomSheetEditor from "@/components/BottomSheetEditor";
import { useEditableList } from "@/hooks/useEditableList";
import { ProfileState } from "..";

const initialOtherMemberState: OtherMember = {
    name: null,
    age: null,
    relation: null,
};
export interface OtherMember {
    name: string | null;
    age: string | null;
    relation: string | null;
}

interface OtherMemberStepProps {
    data: ProfileState;
    onChange: <K extends keyof ProfileState>(
        key: K,
        value: ProfileState[K]
    ) => void;
}

const OtherMemberStep = ({ data, onChange }: OtherMemberStepProps) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [form, setForm] = useState<OtherMember>(initialOtherMemberState);

    const members = useEditableList<OtherMember>(data.others, (list) =>
        onChange("others", list)
    );

    useEffect(() => {
        if (members.initialItem) {
            setForm(members.initialItem);
        } else {
            setForm(initialOtherMemberState);
        }
    }, [members.initialItem]);

    const handleChange = (key: keyof OtherMember, value: any) => {
        console.log({ [key]: value });
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const openAdd = () => {
        members.add();
        sheetRef.current?.present();
    };

    const openEdit = (index: number) => {
        members.edit(index);
        sheetRef.current?.present();
    };

    const handleSave = (member: OtherMember) => {
        members.save(member);
        sheetRef.current?.close();
    };

    return (
        <StepContainer>
            <View className="bg-white gap-4 p-6 rounded-2xl">
                <Text variant="h3" className="text-primary font-bold">
                    Otras personas
                </Text>

                <View className="px-1 gap-4">
                    {data.others.length === 0 ? (
                        <View className="bg-gray-50 items-center justify-center h-24 rounded-2xl border-2 border-gray-300 border-dashed">
                            <Text className="text-gray-400 italic">
                                No hay otras personas registradas
                            </Text>
                        </View>
                    ) : (
                        data.others.map((member, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => openEdit(index)}
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-row justify-between"
                            >
                                <Text className="font-medium">
                                    {member.name}
                                </Text>

                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        members.remove(index);
                                    }}
                                >
                                    <Boxicon
                                        name="bxs-trash-alt"
                                        size={18}
                                        color="#ef4444"
                                    />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}

                    <TouchableOpacity
                        onPress={() => openAdd()}
                        className="bg-primary py-4 rounded-2xl flex-row justify-center gap-2"
                    >
                        <Boxicon name="bxs-plus" size={20} color="white" />
                        <Text className="text-white font-bold">
                            Añadir persona
                        </Text>
                    </TouchableOpacity>

                    <ReusableBottomSheetEditor ref={sheetRef}>
                        <View className="p-6 gap-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">
                                {members.isEditing
                                    ? "Editar Persona"
                                    : "Nueva Persona"}
                            </Text>

                            <Input
                                label="Nombre Completo"
                                placeholder="Nombre de la persona"
                                inSheet
                                value={form.name ?? ""}
                                onChangeText={(t) =>
                                    handleChange("name", t)
                                }
                                iconName="bxs-user"
                            />

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Input
                                        label="Edad"
                                        placeholder="00"
                                        keyboardType="numeric"
                                        inSheet
                                        value={form.age ?? ""}
                                        onChangeText={(t) =>
                                            handleChange("age", t)
                                        }
                                        iconName="bxs-calendar"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        label="Parentesco"
                                        placeholder="Ej. Tío, Abuelo"
                                        inSheet
                                        value={form.relation ?? ""}
                                        onChangeText={(t) =>
                                            handleChange("relation", t)
                                        }
                                        iconName="bxs-group"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleSave(form)}
                                className="bg-primary p-4 rounded-xl"
                            >
                                <Text className="text-white text-center font-bold">
                                    Guardar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ReusableBottomSheetEditor>
                </View>
            </View>
        </StepContainer>
    );
};

export default OtherMemberStep;
