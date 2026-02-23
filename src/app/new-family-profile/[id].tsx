import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from "react-native-reanimated";

// This is the default configuration
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import {
    SubmitHandler,
    useForm,
    Controller,
    useFieldArray,
} from "react-hook-form";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// Archivos
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

// Hooks
import { useCreateFamily } from "@/hooks/useFamilies";
import { useCreateMember } from "@/hooks/useFamilyMember";
import { useUploadDocument } from "@/hooks/useDocuments";
import { FamilyProfile } from "@/types/api";

// Nueva interfaz para acoplar el archivo con su tipo
interface SelectedDocument {
    id: string; // ID local para key de React
    file: DocumentPicker.DocumentPickerAsset;
    type: string;
}

const Page = () => {
    const { bottom } = useSafeAreaInsets();
    const navigation = useNavigation();

    const { mutateAsync: createFamilyAsync } = useCreateFamily();
    const { mutateAsync: createMemberAsync } = useCreateMember();
    const { mutateAsync: uploadDocumentAsync } = useUploadDocument();

    const [isLoading, setIsLoading] = useState(false);

    // Estados para los archivos
    const [photoFile, setPhotoFile] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
    // Cambiamos el array plano por nuestro array estructurado
    const [documents, setDocuments] = useState<SelectedDocument[]>([]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            status: "prospect",
            opened_at: new Date().toISOString().split("T")[0],
            family_name: "",
            current_address: "",
            construction_address: "",
            general_observations: "",
            members: [
                {
                    name: "",
                    paternal_surname: "",
                    birth_date: "",
                    relationship: "",
                    is_responsible: true,
                },
            ],
        },
    });

    const {
        fields,
        append,
        remove: removeMember,
    } = useFieldArray({
        control,
        name: "members",
    });

    const membersWatch = watch("members");

    // --- MANEJO DE ARCHIVOS ---

    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.6,
        });

        if (!result.canceled) {
            setPhotoFile(result.assets[0]);
        }
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
            multiple: true,
        });

        if (!result.canceled) {
            // Transformamos los archivos puros a nuestra estructura con un tipo por defecto
            const newDocs: SelectedDocument[] = result.assets.map((asset) => ({
                id: Math.random().toString(36).substring(7),
                file: asset,
                type: "Documento Anexo", // Tipo por defecto, el usuario lo cambiará en la UI
            }));

            setDocuments((prev) => [...prev, ...newDocs]);
        }
    };

    const removeDocument = (idToRemove: string) => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== idToRemove));
    };

    const updateDocumentType = (idToUpdate: string, newType: string) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === idToUpdate ? { ...doc, type: newType } : doc,
            ),
        );
    };

    // --- ENVÍO DE DATOS ---

    const onSubmit = async (data: any) => {
        const responsibleCount = data.members?.filter(
            (m: any) => m.is_responsible,
        ).length;
        if (responsibleCount !== 1) {
            Alert.alert(
                "Error de validación",
                "Debe asignar exactamente a un (1) miembro como responsable de la familia.",
            );
            return;
        }

        setIsLoading(true);

        try {
            // 1. Crear Familia
            const familyPayload = {
                family_name: data.family_name,
                status: data.status,
                opened_at: data.opened_at,
                current_address:
                    data.current_address?.trim() === ""
                        ? null
                        : data.current_address,
                construction_address:
                    data.construction_address?.trim() === ""
                        ? null
                        : data.construction_address,
                general_observations:
                    data.general_observations?.trim() === ""
                        ? null
                        : data.general_observations,
            };

            const family = await createFamilyAsync(
                familyPayload as Partial<FamilyProfile>,
            );

            if (!family || !family.id) {
                throw new Error(
                    "No se pudo obtener el ID de la familia creada.",
                );
            }

            // 2. Crear Miembros
            const memberPromises =
                data.members?.map((member: any) =>
                    createMemberAsync({
                        family_profile_id: family.id,
                        name: member.name,
                        paternal_surname: member.paternal_surname,
                        birth_date: member.birth_date,
                        relationship: member.relationship,
                        is_responsible: member.is_responsible,
                    }),
                ) ?? [];

            if (memberPromises.length > 0) {
                await Promise.all(memberPromises);
            }

            // 3. Subir Archivos (Bloque tolerante a fallos)
            let uploadErrors = 0;
            try {
                // Foto Principal
                if (photoFile) {
                    const photoData = new FormData();
                    photoData.append("file", {
                        uri: photoFile.uri,
                        name:
                            photoFile.fileName ||
                            `foto_familia_${family.id}.jpg`,
                        type: photoFile.mimeType || "image/jpeg",
                    } as any);
                    photoData.append("documentable_id", family.id.toString());
                    photoData.append("documentable_type", "family_profile");
                    photoData.append("document_type", "Foto Principal");

                    await uploadDocumentAsync({
                        formData: photoData,
                        documentable: "families",
                        id: family.id,
                    });
                }

                // Documentos con su respectivo tipo
                if (documents.length > 0) {
                    const docPromises = documents.map((doc) => {
                        const docData = new FormData();
                        docData.append("file", {
                            uri: doc.file.uri,
                            name: doc.file.name,
                            type:
                                doc.file.mimeType || "application/octet-stream",
                        } as any);
                        docData.append("documentable_id", family.id.toString());
                        docData.append("documentable_type", "family_profile");
                        // Aquí pasamos el tipo exacto que el usuario seleccionó en la UI
                        docData.append("document_type", doc.type);

                        return uploadDocumentAsync({
                            formData: docData,
                            documentable: "families",
                            id: family.id,
                        });
                    });

                    await Promise.all(docPromises);
                }
            } catch (fileError) {
                console.error("Fallo al subir archivos:", fileError);
                uploadErrors++;
            }

            // 4. Conclusión
            if (uploadErrors > 0) {
                Alert.alert(
                    "Proceso Incompleto",
                    "La familia se guardó, pero hubo un problema de conexión al subir la foto o documentos. Súbelos después desde el perfil de la familia.",
                );
            } else {
                ToastAndroid.show(
                    "Familia y archivos registrados correctamente",
                    ToastAndroid.SHORT,
                );
            }

            navigation.goBack();
        } catch (error: any) {
            console.error(
                "Fallo en la transacción principal:",
                error.response?.data || error.message,
            );
            Alert.alert(
                "Error Crítico",
                "Hubo un problema al crear el registro base de la familia.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <KeyboardAwareScrollView contentContainerClassName="p-4 pb-32 gap-4">
                {/* --- DATOS DE LA FAMILIA --- */}
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
                                        {
                                            label: "Prospecto",
                                            value: "prospect",
                                        },
                                        { label: "Activo", value: "active" },
                                        {
                                            label: "En Seguimiento",
                                            value: "in_follow_up",
                                        },
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
                        name="opened_at"
                        rules={{
                            required: "Requerido",
                            pattern: {
                                value: /^\d{4}-\d{2}-\d{2}$/,
                                message: "Formato (YYYY-MM-DD)",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View className="gap-1">
                                <Input
                                    label="Fecha de Registro (YYYY-MM-DD)"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    iconName="bxs-calendar"
                                />
                                {errors.opened_at && (
                                    <Text className="text-red-500 text-sm ml-1">
                                        {errors.opened_at.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="current_address"
                        rules={{ required: "La dirección es obligatoria" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View className="gap-1">
                                <Input
                                    label="Dirección Actual"
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
                            <Input
                                label="Dirección de Construcción"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value ?? ""}
                                iconName="bxs-building-house"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="general_observations"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Textarea
                                label="Observaciones Generales"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value ?? ""}
                                iconName="bxs-note"
                            />
                        )}
                    />
                </View>

                {/* --- MIEMBROS --- */}
                <View className="bg-white p-6 rounded-2xl gap-4">
                    <Text variant="h3" className="text-primary font-bold">
                        Miembros
                    </Text>

                    {fields.map((field, index) => (
                        <View
                            key={field.id}
                            className="border border-gray-200 p-4 rounded-xl gap-3 mb-2"
                        >
                            <View className="flex-row justify-between items-center">
                                <Text className="font-bold text-gray-700">
                                    Miembro {index + 1}
                                </Text>
                                {fields.length > 1 && (
                                    <TouchableOpacity
                                        onPress={() => removeMember(index)}
                                    >
                                        <Text className="text-red-500 font-bold">
                                            Eliminar
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Controller
                                control={control}
                                name={`members.${index}.name`}
                                rules={{ required: "Requerido" }}
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Nombre"
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name={`members.${index}.paternal_surname`}
                                rules={{ required: "Requerido" }}
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Apellido Paterno"
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name={`members.${index}.relationship`}
                                rules={{ required: "Requerido" }}
                                render={({ field: { onChange, value } }) => (
                                    <View className="gap-1">
                                        <Select
                                            label="Rol Familiar"
                                            options={[
                                                {
                                                    label: "👨 Padre de Familia",
                                                    value: "padre",
                                                },
                                                {
                                                    label: "👩 Madre de Familia",
                                                    value: "madre",
                                                },
                                                {
                                                    label: "👶 Hijo(a)",
                                                    value: "hijo",
                                                },
                                                {
                                                    label: "👴 Abuelo(a)",
                                                    value: "abuelo",
                                                },
                                                {
                                                    label: "🧸 Nieto(a)",
                                                    value: "nieto",
                                                },
                                                {
                                                    label: "👤 Otro",
                                                    value: "otro",
                                                },
                                            ]}
                                            value={value}
                                            onValueChange={onChange}
                                        />
                                        {/* Opcional: Mostrar error si no selecciona nada */}
                                        {errors?.members?.[index]
                                            ?.relationship && (
                                            <Text className="text-red-500 text-sm ml-1">
                                                {
                                                    errors.members[index]
                                                        .relationship?.message
                                                }
                                            </Text>
                                        )}
                                    </View>
                                )}
                            />

                            <Controller
                                control={control}
                                name={`members.${index}.birth_date`}
                                rules={{
                                    required: "Requerido",
                                    pattern: /^\d{4}-\d{2}-\d{2}$/,
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Fecha Nac. (YYYY-MM-DD)"
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name={`members.${index}.is_responsible`}
                                render={({ field: { onChange, value } }) => (
                                    <TouchableOpacity
                                        className="flex-row items-center mt-2 py-2"
                                        onPress={() => {
                                            if (!value) {
                                                membersWatch.forEach((_, i) =>
                                                    setValue(
                                                        `members.${i}.is_responsible`,
                                                        false,
                                                    ),
                                                );
                                                onChange(true);
                                            }
                                        }}
                                    >
                                        <View
                                            className={`w-6 h-6 rounded-full border-2 mr-2 items-center justify-center ${value ? "border-primary" : "border-gray-400"}`}
                                        >
                                            {value && (
                                                <View className="w-3 h-3 rounded-full bg-primary" />
                                            )}
                                        </View>
                                        <Text>Es el responsable / titular</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={() =>
                            append({
                                name: "",
                                paternal_surname: "",
                                birth_date: "",
                                relationship: "",
                                is_responsible: false,
                            })
                        }
                        className="border border-primary border-dashed p-4 rounded-xl items-center mt-2"
                    >
                        <Text className="text-primary font-bold">
                            + Agregar familiar
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- ARCHIVOS Y CLASIFICACIÓN --- */}
                <View className="bg-white p-6 rounded-2xl gap-4">
                    <Text variant="h3" className="text-primary font-bold">
                        Evidencia y Documentos
                    </Text>

                    {/* Foto Principal */}
                    <TouchableOpacity
                        onPress={pickPhoto}
                        className="border border-gray-300 border-dashed p-4 rounded-xl items-center flex-row justify-center"
                    >
                        <Text className="font-bold text-gray-700">
                            {photoFile
                                ? `✅ Foto lista (${photoFile.fileName || "imagen"})`
                                : "📷 Añadir Foto Principal"}
                        </Text>
                    </TouchableOpacity>
                    {photoFile && (
                        <TouchableOpacity
                            onPress={() => setPhotoFile(null)}
                            className="items-center"
                        >
                            <Text className="text-red-500 text-sm">
                                Quitar Foto
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View className="w-full h-[1px] bg-gray-200 my-2" />

                    {/* Selector de Documentos */}
                    <TouchableOpacity
                        onPress={pickDocument}
                        className="bg-primary/10 border border-primary border-dashed p-4 rounded-xl items-center"
                    >
                        <Text className="font-bold text-primary">
                            📎 Seleccionar Documentos
                        </Text>
                    </TouchableOpacity>

                    {/* Lista Dinámica de Documentos Seleccionados con su Tipo */}
                    {documents.length > 0 && (
                        <View className="gap-3 mt-2">
                            <Text className="font-bold text-gray-600 text-sm">
                                Clasifica los documentos seleccionados:
                            </Text>

                            {documents.map((doc) => (
                                <View
                                    key={doc.id}
                                    className="border border-gray-200 p-3 rounded-lg gap-2 bg-gray-50"
                                >
                                    <View className="flex-row justify-between items-center">
                                        <Text
                                            className="font-medium text-gray-700 flex-1 mr-2"
                                            numberOfLines={1}
                                        >
                                            📄 {doc.file.name}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                removeDocument(doc.id)
                                            }
                                        >
                                            <Text className="text-red-500 font-bold">
                                                X
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Select
                                        label="Tipo de Documento"
                                        options={[
                                            {
                                                label: "🆔 INE / Identificación",
                                                value: "ine",
                                            },
                                            { label: "📄 CURP", value: "curp" },
                                            {
                                                label: "🏠 Comprobante Domicilio",
                                                value: "proof_of_address",
                                            },
                                            {
                                                label: "✍️ Contrato",
                                                value: "contract",
                                            },
                                            {
                                                label: "📊 Reporte / Estudio",
                                                value: "report",
                                            },
                                            {
                                                label: "📷 Fotografía",
                                                value: "photo",
                                            },
                                            {
                                                label: "📂 Otro",
                                                value: "other",
                                            },
                                        ]}
                                        value={doc.type}
                                        onValueChange={(val) =>
                                            updateDocumentType(doc.id, val)
                                        }
                                        iconName="bxs-file"
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* --- BOTÓN DE SUBMIT --- */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className={`w-full flex-row items-center justify-center gap-2 py-4 rounded-2xl active:scale-[0.98] transition ${isLoading ? "bg-primary/70" : "bg-primary"}`}
                >
                    {isLoading && <ActivityIndicator color="white" />}
                    <Text className="text-white text-base font-bold">
                        {isLoading ? "Guardando..." : "Guardar Todo"}
                    </Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default Page;
