import Boxicon from "@/components/Boxicons";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { Text } from "@/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import StepContainer from "./StepContainer";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import AddParentStep, { Parent } from "./AddParentStep";
import { ProfileState } from "..";
import BottomSheetEditor from "@/components/BottomSheetEditor";
import { useEditableList } from "@/hooks/useEditableList";

interface ParentStepProps {
    data: ProfileState;
    onChange: <K extends keyof ProfileState>(
        key: K,
        value: ProfileState[K]
    ) => void;
}

const ParentStep = ({ data, onChange }: ParentStepProps) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const parents = useEditableList<Parent>(data.parents, (updatedParents) =>
        onChange("parents", updatedParents)
    );

    return (
        <StepContainer>
            <View className="bg-white gap-4 p-6 rounded-2xl">
                <Text variant="h3" className="text-primary font-bold">
                    Datos de los Padres / Tutores
                </Text>
                <View className="px-1 gap-4">
                    {data.parents.length === 0 ? (
                        <View className="bg-gray-50 items-center justify-center h-24 rounded-2xl border-2 border-gray-300 border-dashed">
                            <Text className="text-gray-400 italic">
                                No hay padres/tutores registrados
                            </Text>
                        </View>
                    ) : (
                        data.parents.map((parent: Parent, index: number) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    parents.edit(index);
                                    bottomSheetRef.current?.present();
                                }}
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-row justify-between items-center"
                            >
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 capitalize">
                                        {parent.name}
                                    </Text>
                                    <Text className="text-gray-500 text-sm capitalize">
                                        {parent.relation}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        parents.remove(index);
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
                            parents.add();
                            bottomSheetRef.current?.present();
                        }}
                        className="bg-primary py-4 rounded-2xl flex-row justify-center gap-2"
                    >
                        <Boxicon name="bxs-plus" size={20} color="white" />
                        <Text className="text-white font-bold">
                            Añadir Padre/Tutor
                        </Text>
                    </TouchableOpacity>

                    <BottomSheetEditor ref={bottomSheetRef}>
                        <AddParentStep
                            onSave={(parent) => {
                                parents.save(parent);
                                bottomSheetRef.current?.close();
                            }}
                            initialValues={parents.initialItem}
                        />
                    </BottomSheetEditor>

                    <Text className="text-gray-500">
                        Datos Familiares Generales
                    </Text>

                    <Select
                        iconName="bxs-heart"
                        options={[
                            { label: "Soltero(a)", value: "soltero" },
                            { label: "Casado(a)", value: "casado" },
                            { label: "Unión Libre", value: "union libre" },
                            { label: "Divorciado(a)", value: "divorciado" },
                            { label: "Viudo(a)", value: "viudo" },
                            { label: "Separado(a)", value: "separado" },
                        ]}
                        label="Estado Civil"
                        id="civilState"
                        value={data.civilState ?? ""}
                        onValueChange={(t: string) => onChange("civilState", t)}
                    />

                    {data.civilState && data.civilState !== "soltero" && (
                        <Input
                            iconName="bxs-clock"
                            label="Tiempo en Estado Civil"
                            placeholder="¿Cuánto tiempo llevan así?"
                            id="timeCivilState"
                            value={data.timeCivilState ?? ""}
                            onChangeText={(t: string) =>
                                onChange("timeCivilState", t)
                            }
                        />
                    )}

                    <Select
                        iconName="bxs-church"
                        label="Religión"
                        placeholder="Seleccione su religión"
                        id="religion"
                        value={data.religion ?? ""}
                        onValueChange={(t: string) => onChange("religion", t)}
                        options={[
                            { label: "Católica", value: "catolica" },
                            {
                                label: "Cristiana / Evangélica",
                                value: "cristiana",
                            },
                            {
                                label: "Testigo de Jehová",
                                value: "testigo de jehova",
                            },
                            { label: "Mormona", value: "mormona" },
                            { label: "Adventista", value: "adventista" },
                            { label: "Judía", value: "judia" },
                            { label: "Ninguna", value: "ninguna" },
                            { label: "Otra", value: "otra" },
                        ]}
                    />

                    {data.religion && data.religion !== "ninguna" && (
                        <>
                            <Input
                                iconName="bxs-clock"
                                label="Tiempo practicándola"
                                placeholder="¿Cuánto tiempo lleva practicándola?"
                                id="timeReligion"
                                value={data.timeReligion ?? ""}
                                onChangeText={(t: string) =>
                                    onChange("timeReligion", t)
                                }
                            />
                            <Select
                                iconName="bxs-walking"
                                label="Asistencia"
                                placeholder="¿Con qué frecuencia asiste?"
                                id="churchAttendance"
                                value={data.churchAttendance ?? ""}
                                onValueChange={(t: string) =>
                                    onChange("churchAttendance", t)
                                }
                                options={[
                                    {
                                        label: "Regularmente",
                                        value: "regularmente",
                                    },
                                    { label: "A veces", value: "a veces" },
                                    { label: "Nunca", value: "nunca" },
                                ]}
                            />
                        </>
                    )}

                    <Checkbox
                        iconName="bxs-message-circle-dots-2"
                        label="Lengua indígena"
                        placeholder="¿Hablan alguna lengua indígena?"
                        checked={data.speaksDialect ?? false}
                        onCheckedChange={(val: boolean) =>
                            onChange("speaksDialect", val)
                        }
                    />

                    {data.speaksDialect && (
                        <Input
                            iconName="bxs-quote-left"
                            label="¿Cuál lengua/dialecto?"
                            placeholder="Especifique cuál"
                            id="nativeDialect"
                            value={data.nativeDialect ?? ""}
                            onChangeText={(t: string) =>
                                onChange("nativeDialect", t)
                            }
                        />
                    )}

                    <Checkbox
                        iconName="bxs-bank"
                        label="Apoyo del gobierno"
                        placeholder="¿Reciben apoyo del gobierno?"
                        checked={data.hasGovSupport ?? false}
                        onCheckedChange={(val: boolean) =>
                            onChange("hasGovSupport", val)
                        }
                    />

                    {data.hasGovSupport && (
                        <Textarea
                            iconName="bxs-edit-alt"
                            label="Tipo de apoyo"
                            placeholder="Describa el apoyo que reciben"
                            id="govSupport"
                            value={data.govSupport ?? ""}
                            onChangeText={(t: string) =>
                                onChange("govSupport", t)
                            }
                        />
                    )}

                    <Checkbox
                        iconName="bxs-user-id-card"
                        label="Visa de EE. UU."
                        placeholder="¿Alguien tiene visa para EE. UU.?"
                        id="hasVisa"
                        checked={data.hasVisa ?? false}
                        onCheckedChange={(val: boolean) =>
                            onChange("hasVisa", val)
                        }
                    />

                    <Checkbox
                        iconName="bxs-info-circle"
                        label="Familiares en EE. UU."
                        placeholder="¿Tienen familiares en EE. UU.?"
                        id="familyInUsa"
                        checked={data.familyInUsa ?? false}
                        onCheckedChange={(val: boolean) =>
                            onChange("familyInUsa", val)
                        }
                    />

                    {data.familyInUsa && (
                        <Checkbox
                            iconName="bxs-info-circle"
                            label="Apoyo de familiares"
                            placeholder="¿Reciben apoyo económico de ellos?"
                            checked={data.receivesUsaSupport ?? false}
                            onCheckedChange={(val: boolean) =>
                                onChange("receivesUsaSupport", val)
                            }
                        />
                    )}

                    {data.receivesUsaSupport && (
                        <Textarea
                            iconName="bxs-message-detail"
                            label="Detalles del apoyo"
                            placeholder="Describa qué tipo de apoyo reciben"
                            id="familyInUsaSupport"
                            value={data.familyInUsaSupport ?? ""}
                            onChangeText={(t: string) =>
                                onChange("familyInUsaSupport", t)
                            }
                        />
                    )}

                    <Checkbox
                        iconName="bxs-pill"
                        label="Problemas de adicción"
                        placeholder="¿Alguien tiene problemas de adicción?"
                        checked={data.hasAddiction ?? false}
                        onCheckedChange={(val: boolean) =>
                            onChange("hasAddiction", val)
                        }
                    />

                    {data.hasAddiction && (
                        <Textarea
                            iconName="bxs-pill"
                            label="Detalles de la adicción"
                            placeholder="Describa qué problemas enfrentan"
                            id="addictionProblems"
                            value={data.addictionProblems ?? ""}
                            onChangeText={(t: string) =>
                                onChange("addictionProblems", t)
                            }
                        />
                    )}

                    <Textarea
                        iconName="bxs-megaphone"
                        label="¿Cómo supieron de nosotros?"
                        placeholder="Explica cómo se enteraron de Casas de Esperanza"
                        id="referralSource"
                        value={data.referralSource ?? ""}
                        onChangeText={(t: string) =>
                            onChange("referralSource", t)
                        }
                    />
                </View>
            </View>
        </StepContainer>
    );
};

export default ParentStep;
