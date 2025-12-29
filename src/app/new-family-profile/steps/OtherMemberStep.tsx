import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";
import Input from "@/components/Input";
import { View, TouchableOpacity } from "react-native";
import StepContainer from "./StepContainer";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState, useEffect } from "react";
import ReusableBottomSheetEditor from "@/components/BottomSheetEditor";
import { useEditableList } from "@/hooks/useEditableList";
import { ProfileState } from "../[id]";
import AddOtherMemberStep, { OtherMember } from "./AddOtherMemberStep";

interface OtherMemberStepProps {
    data: ProfileState;
    onChange: <K extends keyof ProfileState>(
        key: K,
        value: ProfileState[K]
    ) => void;
}

const OtherMemberStep = ({ data, onChange }: OtherMemberStepProps) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const otherMembers = useEditableList<OtherMember>(data.otherMembers, (updatedMembers) =>
        onChange("otherMembers", updatedMembers)
    );

    return (
        <StepContainer>
            <View className="bg-white gap-4 p-6 rounded-2xl">
                <Text variant="h3" className="text-primary font-bold">
                    Otras personas
                </Text>

                <View className="px-1 gap-4">
                    {data.otherMembers.length === 0 ? (
                        <View className="bg-gray-50 items-center justify-center h-24 rounded-2xl border-2 border-gray-300 border-dashed">
                            <Text className="text-gray-400 italic">
                                No hay otras personas registradas
                            </Text>
                        </View>
                    ) : (
                        data.otherMembers.map((member, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    otherMembers.edit(index);
                                    bottomSheetRef.current?.present();
                                }}
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-row justify-between"
                            >
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 capitalize">
                                        {member.name}
                                    </Text>
                                    <Text className="text-gray-500 text-sm capitalize">
                                        {member.relation}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        otherMembers.remove(index);
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
                        onPress={() => {
                            otherMembers.add();
                            bottomSheetRef.current?.present();
                        }}
                        className="bg-primary py-4 rounded-2xl flex-row justify-center gap-2"
                    >
                        <Boxicon name="bxs-plus" size={20} color="white" />
                        <Text className="text-white font-bold">
                            Añadir persona
                        </Text>
                    </TouchableOpacity>

                    <ReusableBottomSheetEditor
                        ref={bottomSheetRef}
                    >
                        <AddOtherMemberStep
                            onSave={(otherMember) => {
                                otherMembers.save(otherMember);
                                bottomSheetRef.current?.close();
                            }}
                            initialValues={otherMembers.initialItem}
                        />
                    </ReusableBottomSheetEditor>
                </View>
            </View>
        </StepContainer>
    );
};

export default OtherMemberStep;
