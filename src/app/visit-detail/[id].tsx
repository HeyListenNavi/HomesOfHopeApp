import React, { useEffect, useRef, useState } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Linking,
    ToastAndroid,
    Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVisit } from "@/hooks/useVisits";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BrandBoxicon from "@/components/BrandBoxicons";
import { formatDate } from "@/lib/utils";
import BottomSheet from "@/components/BottomSheet";
import { Note, Task } from "@/types/api";
import InfoRow from "@/components/InfoRow";
import { useUpdateTask } from "@/hooks/useTasks";
import VisitForm from "@/components/VisitForm";

export default function VisitDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const { data: visit, isLoading, isError } = useVisit(Number(id));
    const updateTask = useUpdateTask();

    const [localTasks, setLocalTasks] = useState<Task[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (visit?.tasks) {
            setLocalTasks(visit.tasks);
        }
    }, [visit]);

    const responsible_member = visit?.family_profile?.responsible_member;

    const handleToggleTask = (taskId: number) => {
        setLocalTasks((prevTasks) =>
            prevTasks.map((t) => {
                if (t.id === taskId) {
                    const isNowCompleted = !t.completed_at;
                    return {
                        ...t,
                        completed_at: isNowCompleted
                            ? new Date().toISOString()
                            : null,
                    };
                }
                return t;
            }),
        );
    };

    const handleFinalizeVisit = async () => {
        setIsSyncing(true);

        const tasksToUpdate = localTasks.filter((localTask) => {
            const serverTask = visit?.tasks?.find(
                (t: Task) => t.id === localTask.id,
            );

            const localStatus = !!localTask.completed_at;
            const serverStatus = !!serverTask?.completed_at;

            return localStatus !== serverStatus;
        });

        try {
            await Promise.all(
                tasksToUpdate.map((task) => {
                    const isCompleted = !!task.completed_at;
                    return updateTask.mutateAsync({
                        id: task.id,
                        data: {
                            status: isCompleted ? "completed" : "pending",
                            completed_at: isCompleted ? undefined : null,
                        },
                    });
                }),
            );

            ToastAndroid.show("Tareas sincronizadas", ToastAndroid.SHORT);
            bottomSheetRef.current?.dismiss();
        } catch (error) {
            Alert.alert(
                "Error de Conexión",
                "No se pudieron guardar los cambios. Verifique su internet e intente nuevamente.",
            );
        } finally {
            setIsSyncing(false);
        }
    };

    const openMapsLink = async () => {
        const address = visit?.family_profile?.construction_address_link;

        if (!address) {
            ToastAndroid.show(
                "Enlace de mapas no disponible.",
                ToastAndroid.SHORT,
            );
            return;
        }

        try {
            await Linking.openURL(address);
        } catch (err) {
            ToastAndroid.show(
                "No se pudo abrir la aplicación de mapas.",
                ToastAndroid.SHORT,
            );
        }
    };

    const openPhone = async () => {
        const phone = visit?.family_profile?.responsible_member?.phone;

        if (!phone) {
            ToastAndroid.show(
                "Número de teléfono del responsable no disponible.",
                ToastAndroid.SHORT,
            );
            return;
        }

        const url = `tel:${phone}`;

        try {
            await Linking.openURL(url);
        } catch (err) {
            ToastAndroid.show(
                "No se pudo abrir la aplicación de teléfono.",
                ToastAndroid.SHORT,
            );
        }
    };

    const openWhatsapp = async () => {
        const phone = visit?.family_profile?.responsible_member?.phone;

        if (!phone) {
            ToastAndroid.show(
                "Número de teléfono del responsable no disponible.",
                ToastAndroid.SHORT,
            );
            return;
        }

        const url = `https://wa.me/${phone.replace(/\D/g, "")}`;

        try {
            await Linking.openURL(url);
        } catch (err) {
            ToastAndroid.show(
                "No se pudo abrir la aplicación de WhatsApp.",
                ToastAndroid.SHORT,
            );
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    if (isError || !visit) {
        return (
            <View className="flex-1 justify-center items-center bg-white gap-4">
                <Boxicon name="bxs-x-circle" size={48} color="#ef4444" />
                <Text className="text-gray-500">
                    No se pudo cargar la visita
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                    <Text>Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView
                className="flex-1"
                contentContainerClassName="p-6 pb-28"
                showsVerticalScrollIndicator={false}
            >
                <View className="gap-4">
                    <View className="rounded-2xl">
                        {visit.family_profile?.family_photo_path ? (
                            <Image
                                source={{
                                    uri: visit.family_profile
                                        ?.family_photo_path,
                                }}
                                className="w-full h-64 rounded-2xl bg-gray-200"
                            />
                        ) : (
                            <View className="items-center justify-center w-full h-56 rounded-2xl bg-gray-200">
                                <Text className="text-gray-400 text-center mt-24">
                                    No hay foto disponible
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="rounded-2xl bg-white p-5 gap-4">
                        <View className="gap-2">
                            <Text className="text-2xl font-bold text-gray">
                                {visit.family_profile?.family_name}
                            </Text>

                            {responsible_member ? (
                                <>
                                    <InfoRow
                                        icon="bxs-user-circle"
                                        className="capitalize"
                                        label="Aplicante"
                                        value={responsible_member.full_name}
                                    />

                                    <InfoRow
                                        icon="bxs-phone"
                                        className="capitalize"
                                        label="Telefono"
                                        value={responsible_member.phone}
                                    />

                                    <InfoRow
                                        icon="bxs-home"
                                        className="capitalize"
                                        label="Dirección del terreno"
                                        value={
                                            visit.family_profile
                                                ?.construction_address
                                        }
                                    />

                                    {visit.family_profile?.current_address && (
                                        <InfoRow
                                            icon="bxs-spanner"
                                            className="capitalize"
                                            label="Dirección de la casa"
                                            value={
                                                visit.family_profile
                                                    ?.current_address
                                            }
                                        />
                                    )}
                                </>
                            ) : (
                                <Text>"Sin familiar responsable asignado"</Text>
                            )}
                        </View>

                        <TouchableOpacity
                            className="flex-row gap-0.5 items-center"
                            onPress={() =>
                                router.push(
                                    `/family-profile/${visit.family_profile_id}`,
                                )
                            }
                        >
                            <Text className="text-primary font-bold">
                                Ver Perfil Completo
                            </Text>
                            <Text className="text-primary">
                                <Boxicon
                                    name="bxs-arrow-out-up-right-square"
                                    size={16}
                                />
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() =>
                                    bottomSheetRef.current?.present()
                                }
                                className="flex-1 bg-gray-50 border border-gray-200 px-4 py-4 gap-1 rounded-2xl justify-center items-center"
                            >
                                <BrandBoxicon
                                    name="bx-whatsapp"
                                    size={28}
                                    color="#6b7280"
                                />
                                <Text className="text-gray-500 text-sm font-bold">
                                    WhatsApp
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() =>
                                    bottomSheetRef.current?.present()
                                }
                                className="flex-1 bg-gray-50 border border-gray-200 px-4 py-4 gap-1 rounded-2xl justify-center items-center"
                            >
                                <Boxicon
                                    name="bxs-phone"
                                    size={28}
                                    color="#6b7280"
                                />
                                <Text className="text-gray-500 text-sm font-bold">
                                    Llamar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() =>
                                    bottomSheetRef.current?.present()
                                }
                                className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl justify-center items-center"
                            >
                                <Boxicon
                                    name="bxs-location"
                                    size={28}
                                    color="#ffffff"
                                />
                                <Text className="text-white text-sm font-bold">
                                    Ir Ahora
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="rounded-2xl bg-white p-5 gap-2">
                        <View className="flex-row gap-2">
                            <Text className="text-amber-600">
                                <Boxicon name="bxs-info-circle" size={18} />
                            </Text>
                            <Text className="text-amber-600 font-bold flex-1">
                                Notas de la Visita
                            </Text>
                        </View>
                        <Text className="text-gray-500">
                            {visit.outcome_summary ?? "Sin notas"}
                        </Text>
                    </View>

                    <View className="rounded-2xl bg-white p-5 gap-4">
                        <View className="flex-row gap-2">
                            <Text className="text-primary">
                                <Boxicon name="bxs-checklist" size={18} />
                            </Text>
                            <Text className="font-bold flex-1">
                                Lista de tareas
                            </Text>
                        </View>

                        <View className="gap-2">
                            {localTasks.length > 0 ? (
                                localTasks.map((task: Task) => {
                                    const isCompleted = task.status == 'completed';

                                return (
                                    <TouchableOpacity
                                        key={task.id}
                                        onPress={() =>
                                            handleToggleTask(task.id)
                                        }
                                        className={`border p-4 rounded-2xl gap-3 flex-row items-center transition-all ${
                                            isCompleted
                                                    ? "bg-primary/10 border-transparent"
                                                : "bg-gray-50 border-gray-200"
                                        }`}
                                    >
                                        <Boxicon
                                            name={
                                                isCompleted
                                                    ? "bxs-check-circle"
                                                    : "bx-circle"
                                            }
                                            size={24}
                                            color={
                                                isCompleted
                                                    ? "#15803d"
                                                    : "#9ca3af"
                                            }
                                        />
                                        <View className="flex-1 gap-1">
                                            <Text
                                                className={`font-medium ${
                                                    isCompleted
                                                        ? "text-green-800 line-through decoration-green-800"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {task.title}
                                            </Text>
                                            {task.description && (
                                                <Text
                                                    className={`text-sm ${
                                                        isCompleted
                                                            ? "text-green-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {task.description}
                                                </Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                                })
                            ) : (
                                <Text>Sin tareas asignadas</Text>
                            )}
                        </View>
                    </View>

                    <View className="rounded-2xl bg-white p-5 gap-4">
                        <View className="flex-row gap-2 items-center">
                            <Text className="text-primary">
                                <Boxicon name="bxs-note-book" size={18} />
                            </Text>
                            <Text className="font-bold flex-1 text-gray-800">
                                Notas
                            </Text>
                        </View>

                        <View className="gap-3">
                            {visit.notes && visit.notes.length > 0 ? (
                                visit.notes.map((note: Note) => (
                                    <View
                                        key={note.id}
                                        className="bg-gray-50 p-4 rounded-2xl gap-2"
                                    >
                                        <Text className="text-gray-800 text-sm leading-relaxed">
                                            {note.content}
                                        </Text>

                                        <View className="flex-row justify-between items-center mt-1 pt-2 border-t border-gray-200/50">
                                            <View className="flex-row items-center gap-1">
                                                <Boxicon
                                                    name="bxs-user"
                                                    size={10}
                                                    color="#6b7280"
                                                />
                                                <Text className="text-xs text-gray-500 font-medium">
                                                    {note.author?.name ||
                                                        "Usuario"}
                                                </Text>
                                            </View>

                                            <Text className="text-xs text-gray-400">
                                                {new Date(
                                                    note.created_at,
                                                ).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="items-center justify-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Text className="text-gray-400 text-sm italic">
                                        Sin notas registradas
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => bottomSheetRef.current?.present()}
                        className="w-full flex-row items-center justify-center gap-2 py-4 bg-primary rounded-2xl active:scale-[0.98] transition"
                    >
                        <Text className="text-white text-base font-bold">
                            Finalizar Visita
                        </Text>
                        <Boxicon name="bxs-check" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <BottomSheet ref={bottomSheetRef} snapPoints={[]}>
                <View className="p-6">
                    <VisitForm/>
                </View>
            </BottomSheet>
        </View>
    );
}
