import React from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator, ToastAndroid } from "react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FamilyProfile } from "@/types/api";
import { useCreateFamily } from "@/hooks/useFamilies";
import { useNavigation } from "expo-router";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Boxicon from "@/components/Boxicons";

const Page = () => {
    const { bottom } = useSafeAreaInsets();
    const navigation = useNavigation();
    const { mutate: createFamily, isPending } = useCreateFamily();

    const { control, handleSubmit, formState: { errors } } = useForm<Partial<FamilyProfile>>({
        defaultValues: {
            status: 'prospect',
            opened_at: new Date().toISOString().split('T')[0],
            family_name: '',
            current_address: '',
            construction_address: '',
            general_observations: '',
        },
    });

    const onSubmit: SubmitHandler<Partial<FamilyProfile>> = (data) => {
        console.log("Submitting data:", data);

        createFamily(data, {
            onSuccess: () => {
                ToastAndroid.show("Visita finalizada correctamente", ToastAndroid.SHORT);
                navigation.goBack();
            },
            onError: (error: any) => {
                console.error(error);
                Alert.alert(
                    "Error",
                    "Hubo un problema al crear el perfil familiar.",
                );
            }
        });
    };

    return (
        <View className="flex-1 bg-gray-50">
            <KeyboardAwareScrollView contentContainerClassName="p-4 pb-32 gap-4">
                <View className="bg-white p-6 rounded-2xl gap-4">
                    <Text variant="h3" className="text-primary font-bold">
                        Datos Generales
                    </Text>

                    <Controller
                        control={control}
                        name="family_name"
                        rules={{ required: "El nombre es obligatorio" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View className="gap-1">
                                <Input
                                    label="Nombre de la Familia"
                                    placeholder="Ej. Pérez López"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    iconName="bxs-parent-child"
                                />
                                {errors.family_name && (
                                    <Text className="text-red-500 text-sm ml-1">
                                        {errors.family_name.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="status"
                        rules={{ required: "El estado es obligatorio" }}
                        render={({ field: { onChange, value } }) => (
                            <View className="gap-1">
                                <Select
                                    label="Estado"
                                    options={[
                                        { label: "Prospecto", value: "prospect" },
                                        { label: "Activo", value: "active" },
                                        { label: "En Seguimiento", value: "in_follow_up" },
                                        { label: "Cerrado", value: "closed" },
                                    ]}
                                    value={value}
                                    onValueChange={onChange}
                                    iconName="bxs-flag-alt"
                                />
                                {errors.status && (
                                    <Text className="text-red-500 text-sm ml-1">
                                        {errors.status.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="current_address"
                        rules={{ required: "La dirección actual es obligatoria" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View className="gap-1">
                                <Input
                                    label="Dirección Actual"
                                    placeholder="Dirección donde viven actualmente"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value ?? ""}
                                    iconName="bxs-home"
                                />
                                {errors.current_address && (
                                    <Text className="text-red-500 text-sm ml-1">
                                        {errors.current_address.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="construction_address"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View className="gap-1">
                                <Input
                                    label="Dirección de Construcción"
                                    placeholder="Dirección del terreno/construcción"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value ?? ""}
                                    iconName="bxs-building-house"
                                />
                                {errors.construction_address && (
                                    <Text className="text-red-500 text-sm ml-1">
                                        {errors.construction_address.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="general_observations"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View className="gap-1">
                                <Textarea
                                    label="Observaciones Generales"
                                    placeholder="Notas adicionales sobre la familia..."
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value ?? ""}
                                    iconName="bxs-note"
                                />
                                {errors.general_observations && (
                                    <Text className="text-red-500 text-sm ml-1">
                                        {errors.general_observations.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                </View>
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                    className={`w-full flex-row items-center justify-center gap-2 py-4 rounded-2xl active:scale-[0.98] transition ${isPending ? 'bg-primary/70' : 'bg-primary'}`}
                >
                    {isPending ? (
                        <ActivityIndicator color="white" className="mr-2" />
                    ) : null}
                    <Text className="text-white text-base font-bold">
                        {isPending ? "Guardando..." : "Guardar Perfil Familiar"}
                    </Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default Page;