import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import ToggleGroup from "@/components/ToggleGroup";
import { Text } from "@/components/ui/text";
import { TextInputProps, View } from "react-native";
import StepContainer from "./StepContainer";
import ToggleSwitch from "@/components/ToggleSwitch";

const LandStep = ({ data, onChange }: any) => (
    <StepContainer>
        <View className="bg-white gap-4 p-6 rounded-2xl">
            <Text variant="h3" className="text-primary">
                Terreno
            </Text>
            <View className="px-1 gap-4">
                <Input
                    iconName="bxs-city"
                    label="Ciudad"
                    placeholder="Ciudad"
                    id="landCity"
                    value={data.landCity ?? ""}
                    onChangeText={(t: string) => onChange("landCity", t)}
                />
                <Input
                    iconName="bxs-map"
                    label="Colonia"
                    placeholder="Colonia"
                    id="landNeighborhood"
                    value={data.landNeighborhood ?? ""}
                    onChangeText={(t: string) =>
                        onChange("landNeighborhood", t)
                    }
                />
                <Checkbox
                    iconName="bxs-home"
                    label="Viven en su terreno"
                    placeholder="¿Viven actualmente en su terreno?"
                    checked={data.livesInLand ?? false}
                    onCheckedChange={(val: boolean) =>
                        onChange("livesInLand", val)
                    }
                />
                {data.livesInLand && (
                    <Input
                        iconName="bxs-clock"
                        label="Tiempo en el terreno"
                        placeholder="¿Cuánto tiempo tienen viviendo ahí?"
                        id="timeLivingLand"
                        value={data.timeLivingLand ?? ""}
                        onChangeText={(t: string) =>
                            onChange("timeLivingLand", t)
                        }
                    />
                )}
                <Input
                    iconName="bxs-dollar"
                    label="Costo del terreno"
                    placeholder="Costo total"
                    id="landPrice"
                    keyboardType="number-pad"
                    value={data.landPrice ?? ""}
                    onChangeText={(t: string) => onChange("landPrice", t)}
                    children={
                        <ToggleSwitch
                            leftLabel="MXN"
                            leftValue="mxn"
                            rightLabel="USD"
                            rightValue="usd"
                            value={data.landPriceCurrency ?? "mxn"}
                            onValueChange={(t: string) =>
                                onChange("landPriceCurrency", t)
                            }
                            className="ml-auto"
                        />
                    }
                />
                <Input
                    iconName="bxs-dollar"
                    label="Enganche del terreno"
                    placeholder="Monto del enganche"
                    id="landDownPayment"
                    keyboardType="number-pad"
                    value={data.landDownPayment ?? ""}
                    onChangeText={(t: string) => onChange("landDownPayment", t)}
                    children={
                        <ToggleSwitch
                            leftLabel="MXN"
                            leftValue="mxn"
                            rightLabel="USD"
                            rightValue="usd"
                            value={data.landDownPaymentCurrency ?? "mxn"}
                            onValueChange={(t: string) =>
                                onChange("landDownPaymentCurrency", t)
                            }
                            className="ml-auto"
                        />
                    }
                />
                <Input
                    iconName="bxs-dollar"
                    label="Mensualidad del terreno"
                    placeholder="Monto que pagan al mes"
                    id="landMonthlyPayment"
                    keyboardType="number-pad"
                    value={data.landMonthlyPayment ?? ""}
                    onChangeText={(t: string) =>
                        onChange("landMonthlyPayment", t)
                    }
                    className="flex-1"
                    children={
                        <ToggleSwitch
                            leftLabel="MXN"
                            leftValue="mxn"
                            rightLabel="USD"
                            rightValue="usd"
                            value={data.landMonthlyPaymentCurrency ?? "mxn"}
                            onValueChange={(t: string) =>
                                onChange("landMonthlyPaymentCurrency", t)
                            }
                            className="ml-auto"
                        />
                    }
                />
                <Input
                    iconName="bxs-calendar-check"
                    label="Fecha del último pago"
                    placeholder="Fecha"
                    id="landLastPayment"
                    value={data.landLastPayment ?? ""}
                    onChangeText={(t: string) => onChange("landLastPayment", t)}
                />
                <Input
                    iconName="bxs-check-shield"
                    label="Estatus de pagos"
                    placeholder="¿Están al corriente con los pagos?"
                    id="landPaymentsUptodate"
                    value={data.landPaymentsUptodate ?? ""}
                    onChangeText={(t: string) =>
                        onChange("landPaymentsUptodate", t)
                    }
                />
                <ToggleGroup
                    label="Servicios disponibles"
                    value={data.landServices ?? []}
                    onValueChange={(val: any) => onChange("landServices", val)}
                    items={[
                        { label: "Baño", value: "bano", iconName: "bxs-bath" },
                        {
                            label: "Luz",
                            value: "luz",
                            iconName: "bxs-light-bulb",
                        },
                        {
                            label: "Agua",
                            value: "agua",
                            iconName: "bxs-water-drop",
                        },
                        {
                            label: "Drenaje",
                            value: "drenaje",
                            iconName: "bxs-grid-9",
                        },
                        {
                            label: "Fosa",
                            value: "fosa",
                            iconName: "bxs-cylinder",
                        },
                    ]}
                />
                <Input
                    iconName="bxs-location"
                    label="Ubicación exacta del terreno"
                    placeholder="Código GPS / Google Maps"
                    id="landGps"
                    value={data.landGps ?? ""}
                    onChangeText={(t: string) => onChange("landGps", t)}
                />
                <Input
                    iconName="bxs-file-detail"
                    label="Nombre del dueño del terreno"
                    placeholder="Nombre completo del propietario"
                    id="landOwner"
                    value={data.landOwner ?? ""}
                    onChangeText={(t: string) => onChange("landOwner", t)}
                />
                <Input
                    iconName="bxs-bolt"
                    label="Instalación eléctrica"
                    placeholder="¿Necesitan mufa?"
                    id="landNeedsMufa"
                    value={data.landNeedsMufa ?? ""}
                    onChangeText={(t: string) => onChange("landNeedsMufa", t)}
                />
                <Input
                    iconName="bxs-ruler"
                    label="Medidas del terreno"
                    placeholder="Medidas (en pies)"
                    id="landMeasurements"
                    value={data.landMeasurements ?? ""}
                    onChangeText={(t: string) =>
                        onChange("landMeasurements", t)
                    }
                />
                <Input
                    iconName="bxs-area"
                    label="Área del terreno"
                    placeholder="Área total (pies cuadrados)"
                    id="landArea"
                    value={data.landArea ?? ""}
                    onChangeText={(t: string) => onChange("landArea", t)}
                />
            </View>
        </View>
    </StepContainer>
);

export default LandStep;
