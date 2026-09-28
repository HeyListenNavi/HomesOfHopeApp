import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import type { ApplicantResource } from "@/services/generated/apiTypes";

interface AttendanceConfirmSheetProps {
    applicant: ApplicantResource | null;
    onDismiss: () => void;
    onScanAnother: () => void;
}

const AttendanceConfirmSheet = ({ applicant, onDismiss, onScanAnother }: AttendanceConfirmSheetProps) => {
    if (!applicant) return null;

    const attendance = applicant.current_attendance;
    const scannedAt = attendance?.scanned_at
        ? new Date(attendance.scanned_at).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    return (
        <View className="px-6 pb-4 gap-6">
            {}
            <View className="items-center gap-4 pt-2">
                <View
                    className="h-20 w-20 rounded-3xl items-center justify-center bg-primary/10"
                >
                    <Boxicon
                        name="bxs-check-circle"
                        size={36}
                        color="#16a34a"
                    />
                </View>

                <View className="items-center gap-1.5">
                    <Text className="font-bold text-gray-800 text-2xl text-center leading-tight">
                        Asistencia Registrada
                    </Text>
                    <Text className="text-gray-500 text-base font-medium text-center leading-relaxed">
                        La asistencia fue tomada correctamente
                    </Text>
                </View>
            </View>

            <View className="px-4">
                <View className="py-2 flex-row items-center gap-4">
                    <View className="h-16 w-16 rounded-2xl bg-gray-100 items-center justify-center shrink-0">
                        <Boxicon name="bxs-user" size={28} color="#6b7280" />
                    </View>
                    <View className="flex-1 gap-0.5">
                        <Text className="font-bold text-gray-800 text-xl leading-tight" numberOfLines={1}>
                            {applicant.applicant_name || "Sin nombre"}
                        </Text>
                        <Text className="text-gray-500 text-base font-medium">
                            Aplicante
                        </Text>
                    </View>
                    <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                        <Text className="text-primary text-sm font-bold">Presente</Text>
                    </View>
                </View>

                {(attendance?.attendance_code || applicant.curp || scannedAt) && (
                    <View>
                        {attendance?.attendance_code && (
                            <DetailRow
                                icon="bx-barcode"
                                label="Código"
                                value={attendance.attendance_code}
                            />
                        )}
                        {applicant.curp && (
                            <DetailRow
                                icon="bxs-user-id-card"
                                label="CURP"
                                value={applicant.curp}
                            />
                        )}
                        {scannedAt && (
                            <DetailRow
                                icon="bxs-clock"
                                label="Hora de escaneo"
                                value={scannedAt}
                            />
                        )}
                    </View>
                )}
            </View>

            {}
            <View className="gap-3">
                <TouchableOpacity
                    onPress={onScanAnother}
                    className="h-[56px] rounded-3xl flex-row items-center justify-center gap-2 active:opacity-80 bg-primary shadow-lg shadow-primary/30"
                    accessibilityRole="button"
                    accessibilityLabel="Escanear otro código"
                >
                    <Text className="text-white font-bold text-base">
                        Escanear Otro
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onDismiss}
                    className="py-3.5 rounded-3xl items-center justify-center active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Listo"
                >
                    <Text className="text-gray-500 font-bold text-base">
                        Listo
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AttendanceConfirmSheet;

interface DetailRowProps {
    icon: BoxIconName;
    label: string;
    value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
    return (
        <View
            className="flex-row items-center gap-4 py-4"
        >
            <View className="h-10 w-10 bg-gray-100 rounded-xl items-center justify-center shrink-0">
                <Boxicon name={icon} size={18} color="#6b7280" />
            </View>
            <View className="flex-1">
                <Text className="text-gray-400 text-sm font-medium mb-0.5">
                    {label}
                </Text>
                <Text className="text-gray-800 font-bold text-base">{value}</Text>
            </View>
        </View>
    );
}
