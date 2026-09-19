import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Linking, ToastAndroid, TextInput, ActivityIndicator, ListRenderItem, RefreshControl } from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import ApplicantInterviewCard from "@/components/ApplicantInterviewCard";
import QRScannerModal from "@/components/QRScannerModal";
import AttendanceConfirmSheet from "@/components/AttendanceConfirmSheet";
import ConfirmModal from "@/components/ConfirmModal";
import BottomSheet from "@/components/BottomSheet";
import { formatDate } from "@/lib/utils";
import { useScreenTopPadding } from "@/lib/layout";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/SectionHeader";
import type { ApplicantResource } from "@/services/generated/apiTypes";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useGroupShow, useGroupApplicantsInfinite, useAttendanceScan, useAttendanceUpdate, useGroupCloseAttendance } from "@/services/generated/apiEndpoints";
import EmptyState from "@/components/EmptyState";
import type { GroupApplicants200DataItem } from "@/services/generated/apiTypes";
import Input from "@/components/Input";

const Page = () => {
    const id = Number(useLocalSearchParams<{ id: string }>().id);
    const topPadding = useScreenTopPadding();

    const [searchQuery, setSearchQuery] = useState("");

    const groupQuery = useGroupShow(id, {
        query: { enabled: !isNaN(id) && id > 0 }
    });

    const applicantsQuery = useGroupApplicantsInfinite(id, { search: searchQuery }, {
        query: {
            enabled: !isNaN(id) && id > 0,
            getNextPageParam: (applicantPage) => {
                const currentPage = applicantPage.meta.current_page;
                const lastPage = applicantPage.meta.last_page;
                return currentPage < lastPage ? currentPage + 1 : undefined;
            },
            initialPageParam: 1
        }
    });

    const scanAttendance = useAttendanceScan();
    const updateAttendance = useAttendanceUpdate();
    const closeAttendance = useGroupCloseAttendance();

    const group = groupQuery.data;
    const applicants = applicantsQuery.data?.pages.flatMap(page => page.data) ?? [];
    const isRefreshing = groupQuery.isFetching || (applicantsQuery.isFetching && !applicantsQuery.isFetchingNextPage);

    const attendanceSheetRef = useRef<BottomSheetModal>(null);
    const confirmModalRef = useRef<BottomSheetModal>(null);

    const [scannerOpen, setScannerOpen] = useState(false);
    const [scannedApplicant, setScannedApplicant] = useState<ApplicantResource | null>(null);
    const [localAttendanceClosed, setLocalAttendanceClosed] = useState(false);
    
    const attendanceClosed = !!group?.attendance_closed_at || localAttendanceClosed;

    const onRefresh = () => {
        groupQuery.refetch();
        applicantsQuery.refetch();
    };

    const handleQRScanned = async (code: string) => {
        setScannerOpen(false);
        const found = applicants.find((a) => a.attendance?.attendance_code === code);
        
        if (!found || !found.attendance) {
            ToastAndroid.show(`Código no encontrado: ${code}`, ToastAndroid.SHORT);
            return;
        }

        try {
            await scanAttendance.mutateAsync({
                data: { attendance_code: code, status: "present" }
            });
            
            await applicantsQuery.refetch();
            
            const updatedFound = {
                ...found,
                attendance: { ...found.attendance, status: "present" as const, scanned_at: new Date().toISOString() }
            };
            setScannedApplicant(updatedFound as any);
            attendanceSheetRef.current?.present();
            
        } catch (error) {
            ToastAndroid.show("Error al registrar asistencia con QR", ToastAndroid.SHORT);
        }
    };

    const handleMarkPresent = async (attendanceId: number) => {
        try {
            await updateAttendance.mutateAsync({
                id: String(attendanceId),
                data: { status: "present" }
            });
            
            await applicantsQuery.refetch();
            ToastAndroid.show("Asistencia registrada", ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show("Error al registrar asistencia manual", ToastAndroid.SHORT);
        }
    };

    const handleMarkAttended = async (attendanceId: number) => {
        try {
            await updateAttendance.mutateAsync({
                id: String(attendanceId),
                data: { status: "attended" }
            });
            
            await applicantsQuery.refetch();
            ToastAndroid.show("Asistencia confirmada", ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show("Error al confirmar asistencia", ToastAndroid.SHORT);
        }
    };

    const handleCloseAttendance = async () => {
        confirmModalRef.current?.dismiss();
        
        try {
            await closeAttendance.mutateAsync({ group: id });
            
            setLocalAttendanceClosed(true);
            await applicantsQuery.refetch();
            await groupQuery.refetch(); 
            ToastAndroid.show("Asistencia cerrada correctamente.", ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show("Error al cerrar asistencia", ToastAndroid.SHORT);
        }
    };

    const openMapsLink = async () => {
        if (!group?.location_link) {
            ToastAndroid.show("Enlace de mapas no disponible.", ToastAndroid.SHORT);
            return;
        }
        try {
            await Linking.openURL(group.location_link);
        } catch {
            ToastAndroid.show("No se pudo abrir la aplicación de mapas.", ToastAndroid.SHORT);
        }
    };

    if (groupQuery.isLoading) {
        return (
            <View className="flex-1 bg-gray-100 items-center justify-center" style={{ paddingTop: topPadding }}>
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    if (!group) {
        return (
            <View className="flex-1 bg-gray-100 p-6 justify-center" style={{ paddingTop: topPadding }}>
                <EmptyState emoji="⚠️" title="Grupo no encontrado" subtitle="No se pudieron cargar los detalles de la entrevista." />
            </View>
        );
    }

    const dateObj = group.date_time ? new Date(group.date_time) : null;
    const dateString = dateObj ? formatDate(group.date_time) : "Sin fecha";
    const timeString = dateObj ? dateObj.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "Sin hora";

    const presentCount = applicants.filter(
        (a) => a.attendance?.status === "present" || a.attendance?.status === "attended"
    ).length;
    const pendingCount = applicants.filter((a) => a.attendance?.status === "pending").length;
    const totalCount = applicantsQuery.data?.pages[0]?.meta?.total ?? applicants.length;

    const renderItem: ListRenderItem<GroupApplicants200DataItem> = ({ item }) => (
        <View className="mb-3">
            <ApplicantInterviewCard
                applicant={item as any}
                onMarkPresent={handleMarkPresent}
                onMarkAttended={handleMarkAttended}
            />
        </View>
    );

    const ListHeaderComponent = (
        <View className="gap-6 mb-4">
            <View className="bg-white rounded-3xl shadow-md shadow-black/5 p-6 gap-5">
                <View className="gap-2">
                    <Text className="font-bold text-gray-800 text-2xl leading-tight">
                        {group.name}
                    </Text>
                    <View className="flex-row items-center gap-2 flex-wrap">
                        <Badge className="bg-primary/10 border-transparent px-3 py-1.5 rounded-full">
                            <Text className="text-primary font-bold text-sm">{dateString}</Text>
                        </Badge>
                        <Text className="text-gray-500 font-medium text-sm">{timeString}</Text>
                        {(!group.is_active || attendanceClosed) && (
                            <Badge className="bg-gray-200 border-transparent px-3 py-1.5 rounded-full">
                                <Text className="text-gray-500 font-bold text-sm">Cerrada</Text>
                            </Badge>
                        )}
                    </View>
                </View>

                <View className="gap-4">
                    <InfoRow icon="bxs-location" label="Ubicación">
                        <Text className="text-gray-800 font-medium">{group.location || "Sin ubicación"}</Text>
                    </InfoRow>
                    <InfoRow icon="bxs-group" label="Capacidad">
                        <Text className="text-gray-800 font-medium">
                            {group.current_members_count} / {group.capacity} aplicantes
                        </Text>
                    </InfoRow>
                    {group.attendance_closed_at && (
                        <InfoRow icon="bxs-lock" label="Asistencia cerrada">
                            <Text className="text-gray-800 font-medium">
                                {new Date(group.attendance_closed_at).toLocaleString("es-MX")}
                            </Text>
                        </InfoRow>
                    )}
                </View>

                {group.location_link ? (
                    <TouchableOpacity onPress={openMapsLink} className="bg-primary rounded-2xl h-[48px] flex-row justify-center items-center gap-2 shadow-md shadow-primary/30 active:opacity-90">
                        <Boxicon name="bxs-location" size={20} color="#ffffff" />
                        <Text className="text-white font-bold">Ir a la Ubicación</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {group.message ? (
                <View className="bg-white rounded-3xl shadow-md shadow-black/5 px-6 py-5 gap-3">
                    <SectionHeader emoji="📝" title="Notas" />
                    <Text className="text-gray-700 leading-relaxed text-base">{group.message}</Text>
                </View>
            ) : null}

            <View className="flex-row gap-3">
                <View className="flex-1 bg-white rounded-3xl shadow-md shadow-black/5 py-5 items-center gap-1">
                    <Text className="text-3xl font-bold text-green-600">{presentCount}</Text>
                    <Text className="text-gray-500 text-sm font-medium">Presentes</Text>
                </View>
                <View className="flex-1 bg-white rounded-3xl shadow-md shadow-black/5 py-5 items-center gap-1">
                    <Text className="text-3xl font-bold text-amber-500">{pendingCount}</Text>
                    <Text className="text-gray-500 text-sm font-medium">Pendientes</Text>
                </View>
                <View className="flex-1 bg-white rounded-3xl shadow-md shadow-black/5 py-5 items-center gap-1">
                    <Text className="text-3xl font-bold text-gray-400">{totalCount}</Text>
                    <Text className="text-gray-500 text-sm font-medium">Total</Text>
                </View>
            </View>

            <View className="gap-3">
                {!attendanceClosed ? (
                    <>
                        <TouchableOpacity
                            onPress={() => setScannerOpen(true)}
                            className="bg-primary h-[56px] rounded-3xl flex-row justify-center items-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Boxicon name="bx-qr-scan" size={22} color="#ffffff" />
                            )}
                            <Text className="text-white font-bold text-base">
                                {isRefreshing ? "Procesando..." : "Tomar Lista"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => confirmModalRef.current?.present()}
                            className="flex-row items-center justify-center gap-1.5 py-2 active:opacity-70"
                            disabled={isRefreshing}
                        >
                            <Boxicon name="bxs-lock" size={16} color="#dc2626" />
                            <Text className="text-red-500 font-bold text-base">Cerrar Asistencia</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View className="flex-row items-center justify-center gap-1.5 py-2">
                        <Boxicon name="bxs-lock" size={16} color="#9ca3af" />
                        <Text className="text-gray-400 font-bold text-base">Asistencia Cerrada</Text>
                    </View>
                )}
            </View>

            <View className="flex-row items-center justify-between relative">
                <SectionHeader emoji="👥" title="Aplicantes" />
                <Badge className="absolute top-0 right-0 bg-gray-200 border-transparent px-3 py-1.5 rounded-full">
                    <Text className="text-gray-600 font-bold text-sm">
                        {totalCount} aplicantes
                    </Text>
                </Badge>
            </View>

            <Input
                placeholder="Buscar en el servidor..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                debounce={true}
                debounceDelay={500}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                inputClassName="bg-white border-transparent"
                prefix={<Boxicon name="bx-search" size={20} color="#9ca3af" />}
                suffix={
                    searchQuery.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Boxicon name="bx-x" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ) : undefined
                }
            />
        </View>
    );

    const ListFooterComponent = applicantsQuery.isFetchingNextPage ? (
        <View className="py-6 items-center">
            <ActivityIndicator size="small" color="#61b346" />
        </View>
    ) : null;

    const ListEmptyComponent = applicantsQuery.isPending ? (
        <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#61b346" />
        </View>
    ) : (
        <View className="bg-white rounded-3xl shadow-md shadow-black/5 py-10 items-center gap-3">
            <View className="h-16 w-16 rounded-2xl bg-gray-100 items-center justify-center">
                <Boxicon name="bx-search" size={28} color="#9ca3af" />
            </View>
            <View className="items-center gap-1">
                <Text className="font-bold text-gray-800 text-lg">Sin resultados</Text>
                <Text className="text-gray-400 text-base font-medium text-center px-6">
                    El servidor no encontró ningún aplicante.
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 relative">
            <KeyboardAwareFlatList
                data={applicants}
                renderItem={renderItem}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                ListFooterComponent={ListFooterComponent}
                contentContainerClassName="p-6"
                contentContainerStyle={{ paddingTop: topPadding, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                onEndReached={() => {
                    if (applicantsQuery.hasNextPage && !applicantsQuery.isFetching) {
                        applicantsQuery.fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#61b346"
                        colors={["#61b346"]}
                    />
                }
            />

            <QRScannerModal visible={scannerOpen} onScanned={handleQRScanned} onClose={() => setScannerOpen(false)} />
            
            <BottomSheet ref={attendanceSheetRef} scrollable={false}>
                <AttendanceConfirmSheet
                    applicant={scannedApplicant as any}
                    onDismiss={() => attendanceSheetRef.current?.dismiss()}
                    onScanAnother={() => {
                        attendanceSheetRef.current?.dismiss();
                        setScannerOpen(true);
                    }}
                />
            </BottomSheet>

            <ConfirmModal
                ref={confirmModalRef}
                title="¿Cerrar la asistencia?"
                description={`Los aplicantes pendientes que estén cargados en esta pantalla se marcarán como ausentes de forma definitiva.`}
                confirmLabel="Sí, Cerrar Asistencia"
                confirmVariant="danger"
                onConfirm={handleCloseAttendance}
                onDismiss={() => confirmModalRef.current?.dismiss()}
            />
        </View>
    );
};

function InfoRow({ icon, label, children }: { icon: BoxIconName; label: string; children: React.ReactNode }) {
    return (
        <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 bg-gray-100 rounded-xl items-center justify-center shrink-0">
                <Boxicon name={icon} size={18} color="#6b7280" />
            </View>
            <View className="flex-1">
                <Text className="text-gray-400 text-sm font-medium mb-0.5">{label}</Text>
                {children}
            </View>
        </View>
    );
}

export default Page;
