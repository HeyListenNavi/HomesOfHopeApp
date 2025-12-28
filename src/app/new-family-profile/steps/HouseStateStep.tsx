import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import StepContainer from "./StepContainer";

const HouseStateStep = ({ data, onChange }: any) => (
    <StepContainer>
        <View className="bg-white gap-4 p-6 rounded-2xl">
            <Text variant="h3" className="text-primary font-bold">
                Estado de su Casa
            </Text>
            <View className="px-1 gap-4">
                <Textarea
                    iconName="bxs-home-circle"
                    label="Material y condición del techo"
                    placeholder="Describa el material y estado"
                    id="roofMaterial"
                    value={data.roofMaterial ?? ""}
                    onChangeText={(t: string) => onChange("roofMaterial", t)}
                />
                <Textarea
                    iconName="bxs-layers"
                    label="Material y condición del piso"
                    placeholder="Describa el material y estado"
                    id="floorMaterial"
                    value={data.floorMaterial ?? ""}
                    onChangeText={(t: string) => onChange("floorMaterial", t)}
                />
                <Textarea
                    iconName="bxs-cube"
                    label="Material y condición de paredes"
                    placeholder="Describa el material y estado"
                    id="wallMaterial"
                    value={data.wallMaterial ?? ""}
                    onChangeText={(t: string) => onChange("wallMaterial", t)}
                />
                <Input
                    iconName="bxs-door-open"
                    label="Cuartos para dormir"
                    placeholder="¿Cuántos cuartos tienen?"
                    id="numBedrooms"
                    value={data.numBedrooms ?? ""}
                    onChangeText={(t: string) => onChange("numBedrooms", t)}
                />
                <Textarea
                    iconName="bxs-bed"
                    label="Condición de los cuartos"
                    placeholder="Describa el estado de los cuartos"
                    id="roomCondition"
                    value={data.roomCondition ?? ""}
                    onChangeText={(t: string) => onChange("roomCondition", t)}
                />
                <Textarea
                    iconName="bxs-bath"
                    label="Baño"
                    placeholder="¿Tienen baño dentro? Describa."
                    id="bathroomDetails"
                    value={data.bathroomDetails ?? ""}
                    onChangeText={(t: string) => onChange("bathroomDetails", t)}
                />
                <Textarea
                    iconName="bxs-cabinet"
                    label="Muebles"
                    placeholder="¿Tienen muebles propios? Describa."
                    id="furnitureDetails"
                    value={data.furnitureDetails ?? ""}
                    onChangeText={(t: string) =>
                        onChange("furnitureDetails", t)
                    }
                />
            </View>
        </View>
    </StepContainer>
);

export default HouseStateStep;
