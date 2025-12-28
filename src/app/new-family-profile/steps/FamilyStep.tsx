import Boxicon from "@/components/Boxicons";
import Input from "@/components/Input";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import StepContainer from "./StepContainer";

const FamilyStep = ({ data, onChange }: any) => {
    const maskPhoneNumber = (text: string) => {
        const cleaned = ("" + text).replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6)
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
            6,
            10
        )}`;
    };

    return (
        <StepContainer>
            <View className="relative bg-white items-center justify-center h-96 rounded-2xl border-2 border-gray-300 border-dashed">
                <Boxicon
                    name="bxs-arrow-out-up-square-half"
                    size={48}
                    color="#61b346"
                />
                <Text className="text-primary text-2xl font-bold">
                    Foto Familiar
                </Text>
                <View className="absolute flex-row gap-4 bottom-3 bg-white p-2 rounded-2xl">
                    <TouchableOpacity>
                        <Boxicon
                            name="bxs-x-circle"
                            size={48}
                            color="#ef4444"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Boxicon
                            name="bxs-check-circle"
                            size={48}
                            color="#61b346"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="bg-white gap-4 p-6 rounded-2xl">
                <Text variant="h3" className="text-primary font-bold">
                    Datos de la Familia
                </Text>
                <View className="px-1 gap-4">
                    <Input
                        iconName="bxs-group"
                        label="Apellidos de la familia"
                        placeholder="Escribe los apellidos"
                        id="familyName"
                        value={data.familyName ?? ""}
                        onChangeText={(t: string) =>
                            onChange(
                                "familyName",
                                t.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
                            )
                        }
                    />
                    <Input
                        label="Número de teléfono"
                        placeholder="Ej. 664..."
                        id="phoneNumber"
                        keyboardType="phone-pad"
                        maxLength={12}
                        prefix="+52"
                        value={data.phoneNumber ?? ""}
                        onChangeText={(t: string) =>
                            onChange("phoneNumber", maskPhoneNumber(t))
                        }
                    />
                    <Input
                        label="Número de teléfono extra"
                        placeholder="Número adicional (opcional)"
                        id="phoneNumberExtra"
                        keyboardType="phone-pad"
                        maxLength={12}
                        prefix="+52"
                        value={data.phoneNumberExtra ?? ""}
                        onChangeText={(t: string) =>
                            onChange("phoneNumberExtra", maskPhoneNumber(t))
                        }
                    />
                </View>
            </View>
        </StepContainer>
    );
};

export default FamilyStep;
