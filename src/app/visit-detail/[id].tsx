import React, { useRef } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Image,
    Linking,
    Alert,
    ToastAndroid
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

export default function VisitDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();

    const { data: visit, isLoading, isError } = useVisit(Number(id));

    const openMapsLink = async () => {
        const address = visit?.family_profile?.construction_address_link;

        if (!address) {
            ToastAndroid.show("Enlace de mapas no disponible.", ToastAndroid.SHORT);
            return;
        }

        try {
            await Linking.openURL(address);
        } catch (err) {
            ToastAndroid.show("No se pudo abrir la aplicación de mapas.", ToastAndroid.SHORT);
        }
    };

    const openPhone = async () => {
        const phone = visit?.family_profile?.responsible_member?.phone;

        if (!phone) {
            ToastAndroid.show("Número de teléfono del responsable no disponible.", ToastAndroid.SHORT);
            return;
        }

        const url = `tel:${phone}`;

        try {
            await Linking.openURL(url);
        } catch (err) {
            ToastAndroid.show('No se pudo abrir la aplicación de teléfono.', ToastAndroid.SHORT);
        }
    };

    const openWhatsapp = async () => {
        const phone = visit?.family_profile?.responsible_member?.phone;

        if (!phone) {
            ToastAndroid.show("Número de teléfono del responsable no disponible.", ToastAndroid.SHORT);
            return;
        }

        const url = `https://wa.me/${phone.replace(/\D/g, '')}`;

        try {
            await Linking.openURL(url);
        } catch (err) {
            ToastAndroid.show('No se pudo abrir la aplicación de WhatsApp.', ToastAndroid.SHORT);
        }
    };

    const handleOpenDocument = (url?: string) => {
        if (url) {
            Linking.openURL(url).catch(err => Alert.alert("Error", "No se pudo abrir el documento"));
        } else {
            Alert.alert("Error", "URL del documento no disponible");
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
                <Text className="text-gray-500">No se pudo cargar la visita</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 px-4 py-2 rounded-lg">
                    <Text>Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isScheduled = visit.status === 'scheduled';
    const statusColor = isScheduled ? 'text-blue-600' : 'text-green-600';
    const statusBg = isScheduled ? 'bg-blue-50' : 'bg-green-50';

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView
                className="flex-1"
                contentContainerClassName="p-6 pb-28"
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <View className="mb-6 rounded-3xl bg-white">
                        <View className="relative">
                            {visit.family_profile?.family_photo_path ? (
                                <Image
                                    source={{
                                        uri: visit.family_profile?.family_photo_path
                                    }}
                                    className="w-full h-56 rounded-t-3xl bg-gray-200"
                                />
                            ) : (
                                <View
                                    className="items-center justify-center w-full h-56 rounded-t-3xl bg-gray-200"
                                >
                                    <Text className="text-gray-400 text-center mt-24">No hay foto disponible</Text>
                                </View>
                            )}
                            <View className={`absolute top-4 right-4 px-3 py-1.5 rounded-full ${statusBg}`}>
                                <Text className={`text-xs font-bold ${statusColor} uppercase tracking-wider`}>
                                    {visit.status === 'scheduled' ? 'Programada' : 'En Curso'}
                                </Text>
                            </View>
                        </View>

                        <View className="p-5">
                            <Text className="text-2xl font-bold text-gray-900 leading-tight">
                                {visit.family_profile?.family_name}
                            </Text>
                            <Text className="text-gray-500 mt-1">
                                {visit.family_profile?.responsible_member?.name
                                    ? `Responsable: ${visit.family_profile.responsible_member.name}`
                                    : "Sin familiar responsable asignado"}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-white rounded-2xl p-5 mb-6">
                        <View className="flex-row items-start gap-3 mb-6">
                            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center shrink-0">
                                <Boxicon name="bxs-map" size={18} color="#2563EB" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                                    Dirección de Visita
                                </Text>
                                <Text className="text-sm font-medium text-gray-900 leading-snug">
                                    {visit.location_type === 'construction_site'
                                        ? (visit.family_profile?.construction_address || "Sin dirección de terreno")
                                        : (visit.family_profile?.current_address || "Sin dirección actual")}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between gap-3">
                            <TouchableOpacity onPress={() => openPhone()} className="flex-1 bg-gray-50 py-3 rounded-xl items-center justify-center border border-gray-100 active:bg-gray-100">
                                <Boxicon name="bxs-phone" size={24} color="#374151" />
                                <Text className="text-xs font-semibold text-gray-600 mt-1">Llamar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => openWhatsapp()} className="flex-1 bg-gray-50 py-3 rounded-xl items-center justify-center border border-gray-100 active:bg-gray-100">
                                <BrandBoxicon name="bx-whatsapp" size={24} color="#374151" />
                                <Text className="text-xs font-semibold text-gray-600 mt-1">Mensaje</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => openMapsLink()} className="flex-1 bg-blue-600 py-3 rounded-xl items-center justify-center active:bg-blue-700">
                                <Boxicon name="bxs-location" size={24} color="#ffffff" />
                                <Text className="text-xs font-semibold text-white mt-1">Ir Ahora</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 3. Tasks Checklist */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-base font-bold text-gray-900">Lista de Tareas</Text>
                            <Text className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                {visit.tasks?.filter(t => t.status === 'completed').length || 0} / {visit.tasks?.length || 0}
                            </Text>
                        </View>

                        <View className="gap-3">
                            {visit.tasks?.map((task) => {
                                const isCompleted = task.status === 'completed';
                                return (
                                    <View key={task.id} className={`p-4 rounded-xl border ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-80' : 'bg-white border-gray-100'}`}>
                                        <View className="flex-row items-start gap-3">
                                            <TouchableOpacity className="mt-0.5">
                                                <Boxicon name={isCompleted ? "bxs-check-circle" : "bx-circle"} size={22} color={isCompleted ? "#22c55e" : "#d1d5db"} />
                                            </TouchableOpacity>
                                            <View className="flex-1">
                                                <Text className={`text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                    {task.title}
                                                </Text>
                                                {!isCompleted && (
                                                    <TouchableOpacity className="flex-row items-center mt-3 self-start gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 border-dashed">
                                                        <Boxicon name="bxs-camera" size={12} color="#2563EB" />
                                                        <Text className="text-xs font-semibold text-blue-600">Adjuntar Evidencia</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                            {(!visit.tasks || visit.tasks.length === 0) && (
                                <View className="bg-white p-6 rounded-xl border border-gray-100 border-dashed items-center">
                                    <Text className="text-gray-400 text-sm">No hay tareas asignadas</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* 4. Observations */}
                    <View className="mb-6">
                        <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Observaciones Previas</Text>
                        <View className="bg-white p-4 rounded-xl border border-gray-100">
                            <Text className="text-sm text-gray-600 italic leading-relaxed">
                                {visit.family_profile?.general_observations || "Sin observaciones registradas para esta familia."}
                            </Text>
                        </View>
                    </View>

                    {/* 5. Family Documents */}
                    <View className="mb-6">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Boxicon name="bx-folder" size={20} color="#111827" />
                            <Text className="text-base font-bold text-gray-900">Documentos</Text>
                        </View>

                        <View className="gap-3">
                            {visit.family_profile?.documents && visit.family_profile.documents.length > 0 ? (
                                visit.family_profile.documents.map((doc) => (
                                    <TouchableOpacity
                                        key={doc.id}
                                        onPress={() => handleOpenDocument(doc.url)}
                                        className="bg-white p-3 rounded-xl border border-gray-100 flex-row items-center gap-3 active:bg-gray-50"
                                    >
                                        <View className="w-10 h-10 bg-orange-50 rounded-lg items-center justify-center">
                                            <Boxicon name="bx-file" size={20} color="#ea580c" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                                                {doc.original_name}
                                            </Text>
                                            <Text className="text-xs text-gray-400">
                                                {formatDate(doc.created_at)} • {doc.document_type}
                                            </Text>
                                        </View>
                                        <Boxicon name="bxs-folder-down-arrow" size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View className="bg-white p-6 rounded-xl border border-gray-100 border-dashed items-center">
                                    <Text className="text-gray-400 text-sm">No hay documentos adjuntos</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="mb-4">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Boxicon name="bx-note" size={20} color="#111827" />
                            <Text className="text-base font-bold text-gray-900">Notas de la Familia</Text>
                        </View>

                        <View className="gap-3">
                            {visit.family_profile?.notes && visit.family_profile.notes.length > 0 ? (
                                visit.family_profile.notes.map((note) => (
                                    <View key={note.id} className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <Text className="text-xs font-bold text-yellow-800">
                                                {note.author?.name || 'Usuario'}
                                            </Text>
                                            <Text className="text-xs text-yellow-600/70">
                                                {formatDate(note.created_at)}
                                            </Text>
                                        </View>
                                        <Text className="text-sm text-yellow-900 leading-relaxed">
                                            {note.content}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View className="bg-white p-6 rounded-xl border border-gray-100 border-dashed items-center">
                                    <Text className="text-gray-400 text-sm">No hay notas registradas</Text>
                                </View>
                            )}
                        </View>
                    </View>

                </View>
            </ScrollView>

            <View
                className="absolute bottom-0 w-full bg-white/90 blur-md border-t border-gray-100"
                style={{ paddingBottom: Math.max(insets.bottom, 16), paddingHorizontal: 16, paddingTop: 16 }}
            >
                <TouchableOpacity
                    onPress={() => bottomSheetRef.current?.present()}
                    className="w-full flex-row items-center justify-center gap-2 py-4 bg-gray-900 rounded-2xl active:scale-[0.98] transition"
                >
                    <Text className="text-white text-base font-bold">Finalizar Visita</Text>
                    <Boxicon name="bx-check-square" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <BottomSheet ref={bottomSheetRef} snapPoints={[]}>
                <View className="px-6 pb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-2 mt-2">
                        Evidencia de Cierre
                    </Text>
                    <Text className="text-sm text-gray-500 mb-6">
                        Complete los siguientes campos para finalizar la visita.
                    </Text>

                    <View className="gap-6 pb-10">
                        <View>
                            <Text className="text-xs font-bold text-gray-700 uppercase mb-3">
                                1. Fotografías del sitio <Text className="text-red-500">*</Text>
                            </Text>
                            <TouchableOpacity className="h-24 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50 active:bg-blue-50 active:border-blue-300">
                                <View className="w-10 h-10 bg-white rounded-full items-center justify-center mb-2">
                                    <Boxicon name="bxs-camera" size={20} color="#9CA3AF" />
                                </View>
                                <Text className="text-xs font-medium text-gray-500">Tomar fotos</Text>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-700 uppercase mb-3">
                                2. Video Recorrido <Text className="text-red-500">*</Text>
                            </Text>
                            <TouchableOpacity className="h-20 border border-gray-200 rounded-xl flex-row items-center px-4 bg-white active:bg-gray-50">
                                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                                    <Boxicon name="bxs-video" size={20} color="#dc2626" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-gray-800">Grabar Recorrido</Text>
                                    <Text className="text-xs text-gray-400">Máximo 30 segundos</Text>
                                </View>
                                <Boxicon name="bx-chevron-right" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-700 uppercase mb-3">
                                3. Conclusiones (Audio) <Text className="text-red-500">*</Text>
                            </Text>
                            <TouchableOpacity className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex-row items-center justify-center gap-2 active:bg-red-100">
                                <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <Text className="text-sm font-bold text-red-600">Iniciar Grabación</Text>
                                <Boxicon name="bxs-microphone" size={18} color="#dc2626" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="gap-3 mb-4">
                        <TouchableOpacity
                            className="w-full py-4 bg-gray-900 rounded-2xl active:scale-[0.98]"
                            onPress={() => bottomSheetRef.current?.dismiss()}
                        >
                            <Text className="text-white font-bold text-center text-base">Confirmar y Finalizar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => bottomSheetRef.current?.dismiss()}
                            className="w-full py-3"
                        >
                            <Text className="text-sm font-semibold text-gray-500 text-center">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>
        </View>
    );
}