import Boxicon from "@/components/Boxicons";
import Input from "@/components/Input";
import { Text } from "@/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import StepContainer from "./StepContainer";
import { ProfileState } from "..";
import { useEditableList } from "@/hooks/useEditableList";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { OtherMember } from "./AddOtherMemberStep";
import AddChildStep, { Child } from "./AddChildStep";
import BottomSheetEditor from "@/components/BottomSheetEditor";

interface ChildrenStepProps {
    data: ProfileState;
    onChange: <K extends keyof ProfileState>(
        key: K,
        value: ProfileState[K]
    ) => void;
}

const ChildrenStep = ({ data, onChange }: ChildrenStepProps) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const children = useEditableList<Child>(data.children, (updatedChildren) =>
        onChange("children", updatedChildren)
    );

    return (
        <StepContainer>
            <View className="bg-white gap-4 p-6 rounded-2xl">
                <Text variant="h3" className="text-primary font-bold">
                    Hijos
                </Text>
                <View className="px-1 gap-4">
                    {data.children.length === 0 ? (
                        <View className="bg-gray-50 items-center justify-center h-24 rounded-2xl border-2 border-gray-300 border-dashed">
                            <Text className="text-gray-400 italic">
                                No hay padres/tutores registrados
                            </Text>
                        </View>
                    ) : (
                        data.children.map((child: Child, index: number) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    children.edit(index);
                                    bottomSheetRef.current?.present();
                                }}
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-row justify-between items-center"
                            >
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 capitalize">
                                        {child.name}
                                    </Text>
                                    <Text className="text-gray-500 text-sm capitalize">
                                        {child.age} años
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        children.remove(index);
                                    }}
                                    className="bg-red-100 p-2 rounded-lg"
                                >
                                    <Boxicon
                                        name="bxs-trash-alt"
                                        size={20}
                                        color="#ef4444"
                                    />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            children.add();
                            bottomSheetRef.current?.present();
                        }}
                        className="bg-primary py-4 rounded-2xl flex-row justify-center gap-2"
                    >
                        <Boxicon name="bxs-plus" size={20} color="white" />
                        <Text className="text-white font-bold">
                            Añadir Hijo
                        </Text>
                    </TouchableOpacity>

                    <BottomSheetEditor ref={bottomSheetRef}>
                        <AddChildStep
                            onSave={(child) => {
                                children.save(child);
                                bottomSheetRef.current?.close();
                            }}
                            initialValues={children.initialItem}
                        />
                    </BottomSheetEditor>

                    <Text className="text-gray-500">
                        Información general de los hijos
                    </Text>
                </View>
            </View>
        </StepContainer>
    );
};

export default ChildrenStep;
