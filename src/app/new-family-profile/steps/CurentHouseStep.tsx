import Boxicon from "@/components/Boxicons";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import ToggleSwitch from "@/components/ToggleSwitch";
import StepContainer from "./StepContainer";
import CurrencyInput from "react-native-currency-input";

const CurrentHouseStep = ({ data, onChange }: any) => {
    if (data.livesInLand) {
        return (
            <StepContainer>
                <View className="bg-white p-6 rounded-2xl items-center">
                    <Boxicon name="bxs-home-heart" size={48} color="#61b346" />
                    <Text className="text-gray-500 mt-2 text-center">
                        Como viven en su terreno, esta sección no es necesaria.
                    </Text>
                </View>
            </StepContainer>
        );
    }

    return (
        <StepContainer>
            <View className="bg-white gap-4 p-6 rounded-2xl">
                <Text variant="h3" className="text-primary font-bold">
                    Vivienda Actual
                </Text>
                <View className="px-1 gap-4">
                    <Input
                        iconName="bxs-city"
                        label="Ciudad actual"
                        placeholder="¿En qué ciudad viven?"
                        id="currentCity"
                        value={data.currentCity ?? ""}
                        onChangeText={(t: string) => onChange("currentCity", t)}
                    />
                    <Input
                        iconName="bxs-map"
                        label="Colonia actual"
                        placeholder="¿En qué colonia viven?"
                        id="currentNeighborhood"
                        value={data.currentNeighborhood ?? ""}
                        onChangeText={(t: string) =>
                            onChange("currentNeighborhood", t)
                        }
                    />
                    <Input
                        iconName="bxs-location"
                        label="Ubicación de vivienda actual"
                        placeholder="Código GPS"
                        id="currentGps"
                        value={data.currentGps ?? ""}
                        onChangeText={(t: string) => onChange("currentGps", t)}
                    />
                    <Select
                        iconName="bxs-key"
                        label="Tipo de vivienda"
                        placeholder="¿Es rentada o prestada?"
                        id="housingType"
                        value={data.housingType ?? ""}
                        onValueChange={(t: any) => onChange("housingType", t)}
                        options={[
                            { label: "Rentada", value: "rentada" },
                            { label: "Prestada", value: "prestada" },
                        ]}
                    />
                    <Input
                        iconName="bxs-user"
                        label="Propietario de la vivienda"
                        placeholder="¿Quién les renta o presta?"
                        id="landlordName"
                        value={data.landlordName ?? ""}
                        onChangeText={(t: string) =>
                            onChange("landlordName", t)
                        }
                    />
                    <Input
                        iconName="bxs-clock"
                        label="Tiempo en esta vivienda"
                        placeholder="¿Cuánto tiempo tienen viviendo ahí?"
                        id="timeInCurrentHousing"
                        value={data.timeInCurrentHousing ?? ""}
                        onChangeText={(t: string) =>
                            onChange("timeInCurrentHousing", t)
                        }
                    />

                    {data.housingType === "rentada" && (
                        <>
                            <CurrencyInput
                                value={data.rentCost}
                                onChangeValue={(t: number) =>
                                    onChange("rentCost", t)
                                }
                                prefix="$"
                                delimiter=","
                                precision={0}
                                minValue={0}
                                renderTextInput={(textInputProps) => (
                                    <Input
                                        iconName="bxs-dollar-circle"
                                        label="Costo de renta"
                                        placeholder="¿Cuánto pagan al mes?"
                                        id="rentCost"
                                        keyboardType="number-pad"
                                        maxLength={15}
                                        {...textInputProps}
                                        children={
                                            <ToggleSwitch
                                                leftLabel="MXN"
                                                leftValue="mxn"
                                                rightLabel="USD"
                                                rightValue="usd"
                                                value={
                                                    data.rentCostCurrency ??
                                                    "mxn"
                                                }
                                                onValueChange={(t: string) =>
                                                    onChange(
                                                        "rentCostCurrency",
                                                        t
                                                    )
                                                }
                                                className="ml-auto"
                                            />
                                        }
                                    />
                                )}
                            />
                            <Checkbox
                                iconName="bxs-receipt"
                                label="Comprobantes de pago"
                                placeholder="¿Tienen comprobantes de pago?"
                                id="hasRentReceipts"
                                checked={data.hasRentReceipts ?? false}
                                onCheckedChange={(val: boolean) =>
                                    onChange("hasRentReceipts", val)
                                }
                            />
                        </>
                    )}
                </View>
            </View>
        </StepContainer>
    );
};

export default CurrentHouseStep;
