import Boxicon from "@/components/Boxicons";
import Input from "@/components/Input";
import { Text } from "@/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import { StepContainer } from "./StepContainer";

const ChildrenStep = ({ data, onChange }: any) => (
    <StepContainer>
        <View className="bg-white gap-4 p-6 rounded-2xl">
            <Text variant="h3" className="text-primary">
                Hijos
            </Text>
            <View className="px-1 gap-4">
                <View className="bg-gray-50 items-center justify-center h-24 rounded-2xl border-2 border-gray-300 border-dashed">
                    <Text className="text-gray-400 italic">
                        No hay hijos registrados
                    </Text>
                </View>
                <TouchableOpacity className="bg-primary w-full py-4 gap-1 rounded-2xl flex-row justify-center items-center">
                    <Boxicon name="bxs-plus" size={20} color="white" />
                    <Text className="text-white font-bold">Añadir hijo</Text>
                </TouchableOpacity>
                <Text className="text-gray-500">
                    Información general de los hijos
                </Text>
                <Input
                    iconName="bxs-info-circle"
                    label="¿Algún hijo tiene una necesidad especial?"
                    placeholder="Auto-generado"
                    id="hasSpecialNeeds"
                    value={data.hasSpecialNeeds ?? ""}
                    onChangeText={(t: string) => onChange("hasSpecialNeeds", t)}
                />
                <Input
                    iconName="bxs-briefcase"
                    label="¿Algún hijo trabaja?"
                    placeholder="Auto-generado"
                    id="childrenWorking"
                    value={data.childrenWorking ?? ""}
                    onChangeText={(t: string) => onChange("childrenWorking", t)}
                />
            </View>
        </View>
    </StepContainer>
);

export default ChildrenStep;