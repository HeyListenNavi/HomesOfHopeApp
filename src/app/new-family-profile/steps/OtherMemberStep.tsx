import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import { StepContainer } from "./StepContainer";

const OtherMemberStep = ({ data, onChange }: any) => (
    <StepContainer>
        <View className="bg-white gap-4 p-6 rounded-2xl">
            <Text variant="h3" className="text-primary">
                Otras personas
            </Text>
            <View className="px-1 gap-4">
                <View className="bg-gray-50 items-center justify-center h-24 rounded-2xl border-2 border-gray-300 border-dashed">
                    <Text className="text-gray-400 italic">
                        No hay otras personas registradas
                    </Text>
                </View>
                <TouchableOpacity className="bg-primary w-full py-4 gap-1 rounded-2xl flex-row justify-center items-center">
                    <Boxicon name="bxs-plus" size={20} color="white" />
                    <Text className="text-white font-bold">Añadir persona</Text>
                </TouchableOpacity>
            </View>
        </View>
    </StepContainer>
);

export default OtherMemberStep;
