import Boxicon from "@/components/Boxicons";
import Input from "@/components/Input";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import StepContainer from "./StepContainer";
import DocumentPreviewer from "@/components/DocumentPreviewer";

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
            <View className="bg-white gap-4 p-6 rounded-2xl">
                <DocumentPreviewer
                    label="Foto Familiar"
                    description="Verificar: Que toda la familia aparezca en la foto"
                    needsReview={true}
                />
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
