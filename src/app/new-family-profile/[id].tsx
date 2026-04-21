import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from "react-native-reanimated";

// This is the default configuration
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useLocalSearchParams } from "expo-router";
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
import * as FileSystem from "expo-file-system/legacy";

import { useCreateFamily, useUpdateFamily, useFamily } from "@/hooks/useFamilies";
import { useCreateMember, useUpdateMember, useDeleteMember } from "@/hooks/useFamilyMember";
import { useUploadDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { FamilyProfile, Document as ApiDocument } from "@/types/api";
import DatePickerInput from "@/components/DatePickerInput";
import ImagePickerSheet from "@/components/ImagePickerSheet";
import * as Print from "expo-print";

// Nueva interfaz para acoplar el archivo con su tipo
interface SelectedDocument {
    id: string; // ID local para key de React
    file: DocumentPicker.DocumentPickerAsset;
    type: string;
}

const Page = () => {
    const { bottom } = useSafeAreaInsets();
    const navigation = useNavigation();
    const { id: idParam } = useLocalSearchParams<{ id: string }>();

    // Edit mode when id is a real family id (not the placeholder "123")
    const isEditMode = !!idParam && idParam !== "123";
    const familyId = isEditMode ? Number(idParam) : null;

    const { data: existingFamily, isLoading: isFamilyLoading } = useFamily(
        familyId ?? 0
    );

    const { mutateAsync: createFamilyAsync } = useCreateFamily();
    const { mutateAsync: updateFamilyAsync } = useUpdateFamily();
    const { mutateAsync: createMemberAsync } = useCreateMember();
    const { mutateAsync: updateMemberAsync } = useUpdateMember();
    const { mutateAsync: deleteMemberAsync } = useDeleteMember();
    const { mutateAsync: uploadDocumentAsync } = useUploadDocument();
    const { mutateAsync: deleteDocumentAsync } = useDeleteDocument();

    const [isLoading, setIsLoading] = useState(false);

    // Tracks an already-created family ID so retries don't create duplicates
    const createdFamilyIdRef = useRef<number | null>(null);
    // Track which original member IDs have been removed from the list
    const removedMemberIdsRef = useRef<number[]>([]);

    // Estados para los archivos
    const [photoFile, setPhotoFile] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
    const [documents, setDocuments] = useState<SelectedDocument[]>([]);
    // Existing documents (edit mode) — separate from newly picked ones
    const [existingDocuments, setExistingDocuments] = useState<ApiDocument[]>([]);
    const [showPhotoPicker, setShowPhotoPicker] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            status: "prospect",
            opened_at: new Date().toISOString().split("T")[0],
            family_name: "",
            current_address: "",
            construction_address: "",
            general_observations: "",
            members: [
                {
                    existingMemberId: undefined as number | undefined,
                    name: "",
                    paternal_surname: "",
                    birth_date: "",
                    relationship: "",
                    occupation: "",
                    phone: "",
                    is_responsible: true,
                },
            ],
        },
    });

    // Pre-populate form when editing an existing family
    useEffect(() => {
        if (isEditMode && existingFamily) {
            reset({
                family_name: existingFamily.family_name ?? "",
                status: existingFamily.status ?? "prospect",
                opened_at: existingFamily.opened_at ?? new Date().toISOString().split("T")[0],
                current_address: existingFamily.current_address ?? "",
                construction_address: existingFamily.construction_address ?? "",
                general_observations: existingFamily.general_observations ?? "",
                members: existingFamily.members && existingFamily.members.length > 0
                    ? existingFamily.members.map((m) => ({
                          existingMemberId: m.id,
                          name: m.name ?? "",
                          paternal_surname: m.paternal_surname ?? "",
                          birth_date: m.birth_date ?? "",
                          relationship: m.relationship ?? "",
                          occupation: m.occupation ?? "",
                          phone: m.phone ?? "",
                          is_responsible: m.is_responsible ?? false,
                      }))
                    : [
                          {
                              existingMemberId: undefined,
                              name: "",
                              paternal_surname: "",
                              birth_date: "",
                              relationship: "",
                              occupation: "",
                              phone: "",
                              is_responsible: true,
                          },
                      ],
            });
            // Load existing documents (excluding the main photo which has its own field)
            setExistingDocuments(
                (existingFamily.documents ?? []).filter(
                    (d) => d.document_type !== "Foto Principal",
                ),
            );
        }
    }, [isEditMode, existingFamily]);

    const {
        fields,
        append,
        remove: removeField,
    } = useFieldArray({
        control,
        name: "members",
    });

    const membersWatch = watch("members");

    // When removing a member in edit mode, track its DB id so we can delete it on save
    const removeMember = (index: number) => {
        const member = membersWatch[index];
        if (member?.existingMemberId) {
            removedMemberIdsRef.current = [
                ...removedMemberIdsRef.current,
                member.existingMemberId,
            ];
        }
        removeField(index);
    };

    // --- MANEJO DE ARCHIVOS ---

    const pickPhoto = () => setShowPhotoPicker(true);

    const takePhotoWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permiso denegado", "No se concedió acceso a la cámara.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) setPhotoFile(result.assets[0]);
    };

    const chooseFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) setPhotoFile(result.assets[0]);
    };

    /** Scan multiple pages → combine into PDF → add as a document */
    const scanMultiplePages = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permiso denegado", "No se concedió acceso a la cámara.");
            return;
        }

        const pages: string[] = [];
        let scanning = true;

        while (scanning) {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled) {
                scanning = false;
                break;
            }

            pages.push(result.assets[0].uri);

            // Ask if user wants to scan another page
            const { userChoice } = await new Promise<{ userChoice: string }>(
                (resolve) => {
                    Alert.alert(
                        `Página ${pages.length} escaneada`,
                        "¿Deseas agregar otra página?",
                        [
                            {
                                text: "Agregar página",
                                onPress: () => resolve({ userChoice: "continue" }),
                            },
                            {
                                text: "Terminar",
                                style: "destructive",
                                onPress: () => resolve({ userChoice: "done" }),
                            },
                        ],
                    );
                },
            );

            if (userChoice === "done") scanning = false;
        }

        if (pages.length === 0) return;

        // Read each image as base64 so expo-print's WebView can render them
        // (file:// URIs are not accessible from the WebView sandbox)
        const base64Images = await Promise.all(
            pages.map((uri) =>
                FileSystem.readAsStringAsync(uri, {
                    encoding: "base64",
                }),
            ),
        );

        const imgTags = base64Images
            .map(
                (b64) =>
                    `<div style="width:100vw;height:100vh;page-break-after:always;display:flex;align-items:center;justify-content:center;margin:0;padding:0;box-sizing:border-box;">` +
                    `<img src="data:image/jpeg;base64,${b64}" style="max-width:100%;max-height:100%;object-fit:contain;display:block;" />` +
                    `</div>`,
            )
            .join("");

        const { uri: pdfUri } = await Print.printToFileAsync({
            html: `<html><head><style>*{margin:0;padding:0;box-sizing:border-box;}body{margin:0;padding:0;}</style></head><body>${imgTags}</body></html>`,
            base64: false,
        });

        // Wrap the PDF as a local DocumentPicker asset
        const fakePdfAsset: DocumentPicker.DocumentPickerAsset = {
            uri: pdfUri,
            name: `escaneo_${Date.now()}.pdf`,
            size: 0,
            mimeType: "application/pdf",
            lastModified: Date.now(),
        };

        const newDoc: SelectedDocument = {
            id: Math.random().toString(36).substring(7),
            file: fakePdfAsset,
            type: "other",
        };

        setDocuments((prev) => [...prev, newDoc]);
        Alert.alert(
            "¡Escaneado!",
            `${pages.length} página(s) guardadas como PDF.`,
        );
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

    // Remove an already-uploaded document immediately (edit mode)
    const removeExistingDocument = async (docId: number) => {
        try {
            await deleteDocumentAsync(docId);
            setExistingDocuments((prev) => prev.filter((d) => d.id !== docId));
        } catch (err) {
            Alert.alert("Error", "No se pudo eliminar el documento. Intenta de nuevo.");
        }
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

        try {
            if (isEditMode && familyId) {
                // ── EDIT MODE ───────────────────────────────────────────────

                // 1. Update family fields
                await updateFamilyAsync({ id: familyId, data: familyPayload as Partial<FamilyProfile> });

                // 2. Delete removed members
                await Promise.allSettled(
                    removedMemberIdsRef.current.map((memberId) =>
                        deleteMemberAsync(memberId),
                    ),
                );
                removedMemberIdsRef.current = [];

                // 3. Update existing members / create new ones
                const memberResults = await Promise.allSettled(
                    (data.members ?? []).map((member: any, idx: number) => {
                        const payload = {
                            family_profile_id: familyId!,
                            name: member.name,
                            paternal_surname: member.paternal_surname,
                            birth_date: member.birth_date,
                            relationship: member.relationship,
                            is_responsible: member.is_responsible,
                            occupation: member.occupation?.trim() || null,
                            phone: member.phone?.trim() || null,
                        };
                        if (member.existingMemberId) {
                            return updateMemberAsync({ id: member.existingMemberId, data: payload }).catch((err: any) => {
                                console.error(`[Miembro ${idx + 1}] Error al actualizar:`, err?.response?.data ?? err?.message);
                                throw err;
                            });
                        } else {
                            return createMemberAsync(payload).catch((err: any) => {
                                console.error(`[Miembro ${idx + 1}] Error al crear:`, err?.response?.data ?? err?.message);
                                throw err;
                            });
                        }
                    }),
                );

                const failedMembers = memberResults.filter((r) => r.status === "rejected");
                if (failedMembers.length > 0) {
                    throw new Error(`No se pudieron guardar ${failedMembers.length} miembro(s).`);
                }

                // 4. Existing document deletions are handled immediately via removeExistingDocument

                // 5. Upload any new files (photo / docs)
                let uploadErrors = 0;
                try {
                    if (photoFile) {
                        const photoData = new FormData();
                        photoData.append("file", {
                            uri: photoFile.uri,
                            name: photoFile.fileName || `foto_familia_${familyId}.jpg`,
                            type: photoFile.mimeType || "image/jpeg",
                        } as any);
                        photoData.append("documentable_id", familyId.toString());
                        photoData.append("documentable_type", "family_profile");
                        photoData.append("document_type", "Foto Principal");
                        await uploadDocumentAsync({ formData: photoData, documentable: "families", id: familyId });
                    }
                    if (documents.length > 0) {
                        await Promise.all(
                            documents.map((doc) => {
                                const docData = new FormData();
                                docData.append("file", { uri: doc.file.uri, name: doc.file.name, type: doc.file.mimeType || "application/octet-stream" } as any);
                                docData.append("documentable_id", familyId!.toString());
                                docData.append("documentable_type", "family_profile");
                                docData.append("document_type", doc.type);
                                return uploadDocumentAsync({ formData: docData, documentable: "families", id: familyId! });
                            }),
                        );
                    }
                } catch (fileError) {
                    console.error("Fallo al subir archivos:", fileError);
                    uploadErrors++;
                }

                if (uploadErrors > 0) {
                    Alert.alert("Proceso Incompleto", "La familia se actualizó, pero hubo un problema al subir archivos.");
                } else {
                    ToastAndroid.show("Familia actualizada correctamente", ToastAndroid.SHORT);
                }

                navigation.goBack();

            } else {
                // ── CREATE MODE ─────────────────────────────────────────────

                // 1. Crear Familia (solo si no fue creada en un intento previo)
                let newFamilyId = createdFamilyIdRef.current;

                if (!newFamilyId) {
                    const familyRaw = await createFamilyAsync(
                        familyPayload as Partial<FamilyProfile>,
                    );

                    const family: FamilyProfile = (familyRaw as any)?.data ?? familyRaw;

                    console.log(
                        "[Crear Familia] Respuesta de Laravel:",
                        JSON.stringify(familyRaw, null, 2),
                    );

                    if (!family || !family.id) {
                        throw new Error("No se pudo obtener el ID de la familia creada.");
                    }

                    createdFamilyIdRef.current = family.id;
                    newFamilyId = family.id;
                }

                // 2. Crear Miembros
                const memberResults = await Promise.allSettled(
                    (data.members ?? []).map((member: any, idx: number) =>
                        createMemberAsync({
                            family_profile_id: newFamilyId!,
                            name: member.name,
                            paternal_surname: member.paternal_surname,
                            birth_date: member.birth_date,
                            relationship: member.relationship,
                            is_responsible: member.is_responsible,
                            ...(member.occupation?.trim() ? { occupation: member.occupation.trim() } : {}),
                            ...(member.phone?.trim() ? { phone: member.phone.trim() } : {}),
                        }).catch((err: any) => {
                            console.error(`[Miembro ${idx + 1}] Error al crear:`, JSON.stringify(err?.response?.data ?? err?.message, null, 2));
                            throw err;
                        }),
                    ),
                );

                const failedMembers = memberResults.filter((r) => r.status === "rejected");
                if (failedMembers.length > 0) {
                    throw new Error(`No se pudieron crear ${failedMembers.length} miembro(s).`);
                }

                // 3. Subir Archivos
                let uploadErrors = 0;
                try {
                    if (photoFile) {
                        const photoData = new FormData();
                        photoData.append("file", {
                            uri: photoFile.uri,
                            name: photoFile.fileName || `foto_familia_${newFamilyId}.jpg`,
                            type: photoFile.mimeType || "image/jpeg",
                        } as any);
                        photoData.append("documentable_id", newFamilyId.toString());
                        photoData.append("documentable_type", "family_profile");
                        photoData.append("document_type", "Foto Principal");
                        await uploadDocumentAsync({ formData: photoData, documentable: "families", id: newFamilyId });
                    }
                    if (documents.length > 0) {
                        await Promise.all(
                            documents.map((doc) => {
                                const docData = new FormData();
                                docData.append("file", { uri: doc.file.uri, name: doc.file.name, type: doc.file.mimeType || "application/octet-stream" } as any);
                                docData.append("documentable_id", newFamilyId!.toString());
                                docData.append("documentable_type", "family_profile");
                                docData.append("document_type", doc.type);
                                return uploadDocumentAsync({ formData: docData, documentable: "families", id: newFamilyId! });
                            }),
                        );
                    }
                } catch (fileError) {
                    console.error("Fallo al subir archivos:", fileError);
                    uploadErrors++;
                }

                createdFamilyIdRef.current = null;
                if (uploadErrors > 0) {
                    Alert.alert(
                        "Proceso Incompleto",
                        "La familia se guardó, pero hubo un problema al subir la foto o documentos. Súbelos después desde el perfil de la familia.",
                    );
                } else {
                    ToastAndroid.show("Familia y archivos registrados correctamente", ToastAndroid.SHORT);
                }

                navigation.goBack();
            }
        } catch (error: any) {
            const apiMessage = error.response?.data?.message;
            console.error("Fallo en la transacción:", error.response?.data || error.message);

            if (!isEditMode && createdFamilyIdRef.current) {
                Alert.alert(
                    "Error Parcial",
                    apiMessage ?? "El perfil familiar fue creado, pero hubo un problema al registrar los integrantes. Puedes volver a intentarlo — no se creará un duplicado.",
                );
            } else {
                Alert.alert(
                    "Error",
                    apiMessage ?? (isEditMode
                        ? "Hubo un problema al actualizar el perfil familiar."
                        : "Hubo un problema al crear el perfil familiar. Por favor intenta de nuevo."),
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Show spinner while loading existing data in edit mode
    if (isEditMode && isFamilyLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#61b346" />
                <Text className="mt-4 text-gray-500">Cargando datos de la familia...</Text>
            </View>
        );
    }

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
                        rules={{ required: "Requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <View className="gap-1">
                                <DatePickerInput
                                    label="Fecha de Registro"
                                    value={value ?? ""}
                                    onChange={onChange}
                                    maximumDate={new Date()}
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
                                rules={{ required: "El nombre es requerido" }}
                                render={({ field: { onChange, value } }) => (
                                    <View className="gap-1">
                                        <Input
                                            label="Nombre"
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                        {errors?.members?.[index]?.name && (
                                            <Text className="text-red-500 text-sm ml-1">
                                                {errors.members[index].name?.message}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            />

                            <Controller
                                control={control}
                                name={`members.${index}.paternal_surname`}
                                rules={{ required: "El apellido es requerido" }}
                                render={({ field: { onChange, value } }) => (
                                    <View className="gap-1">
                                        <Input
                                            label="Apellido Paterno"
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                        {errors?.members?.[index]?.paternal_surname && (
                                            <Text className="text-red-500 text-sm ml-1">
                                                {errors.members[index].paternal_surname?.message}
                                            </Text>
                                        )}
                                    </View>
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
                                rules={{ required: "Requerido" }}
                                render={({ field: { onChange, value } }) => (
                                    <DatePickerInput
                                        label="Fecha de Nacimiento"
                                        value={value ?? ""}
                                        onChange={onChange}
                                        maximumDate={new Date()}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name={`members.${index}.occupation`}
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Ocupación (opcional)"
                                        placeholder="Ej. Estudiante, Carpintero..."
                                        iconName="bxs-briefcase"
                                        onChangeText={onChange}
                                        value={value ?? ""}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name={`members.${index}.phone`}
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label="Teléfono / WhatsApp (opcional)"
                                        placeholder="+52 000-000-0000"
                                        iconName="bxs-phone"
                                        keyboardType="phone-pad"
                                        onChangeText={onChange}
                                        value={value ?? ""}
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
                                existingMemberId: undefined,
                                name: "",
                                paternal_surname: "",
                                birth_date: "",
                                relationship: "",
                                occupation: "",
                                phone: "",
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
                        className="border border-gray-300 border-dashed p-4 rounded-xl items-center flex-row justify-center gap-2"
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

                    {/* Documentos ya subidos (solo en modo edición) */}
                    {isEditMode && existingDocuments.length > 0 && (
                        <View className="gap-2">
                            <Text className="font-bold text-gray-600 text-sm">
                                Documentos actuales:
                            </Text>
                            {existingDocuments.map((doc) => (
                                <View
                                    key={doc.id}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-xl"
                                >
                                    <View className="flex-1 mr-2">
                                        <Text className="font-medium text-gray-700" numberOfLines={1}>
                                            📄 {doc.original_name || "Documento"}
                                        </Text>
                                        <Text className="text-xs text-gray-400 mt-0.5">
                                            {doc.document_type}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                "Eliminar documento",
                                                `¿Eliminar "${doc.original_name}"?`,
                                                [
                                                    { text: "Cancelar", style: "cancel" },
                                                    {
                                                        text: "Eliminar",
                                                        style: "destructive",
                                                        onPress: () => removeExistingDocument(doc.id),
                                                    },
                                                ],
                                            );
                                        }}
                                        className="bg-red-50 px-3 py-1.5 rounded-lg"
                                    >
                                        <Text className="text-red-500 font-bold text-sm">Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View className="w-full h-[1px] bg-gray-100 my-1" />
                        </View>
                    )}

                    {/* Selector de Documentos */}
                    <View className="gap-2">
                        <TouchableOpacity
                            onPress={pickDocument}
                            className="bg-primary/10 border border-primary border-dashed p-4 rounded-xl items-center"
                        >
                            <Text className="font-bold text-primary">
                                📎 Seleccionar Documentos
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={scanMultiplePages}
                            className="bg-blue-50 border border-blue-300 border-dashed p-4 rounded-xl items-center"
                        >
                            <Text className="font-bold text-blue-600">
                                📷 Escanear páginas → PDF
                            </Text>
                        </TouchableOpacity>
                    </View>

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

            {/* Styled Bottom Sheet for photo/camera picker */}
            <ImagePickerSheet
                visible={showPhotoPicker}
                onClose={() => setShowPhotoPicker(false)}
                title="Agregar Fotografía"
                options={[
                    {
                        label: "Tomar Foto",
                        icon: "bxs-camera",
                        onPress: takePhotoWithCamera,
                    },
                    {
                        label: "Elegir de Galería",
                        icon: "bxs-image",
                        color: "#6366f1",
                        onPress: chooseFromGallery,
                    },
                ]}
            />
        </View>
    );
};

export default Page;
