import React, { useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Boxicon from "@/components/Boxicons";
import { useRouter } from "expo-router";
import type { ApplicantResource, AttendanceStatus } from "@/services/generated/apiTypes";
import ConfirmModal from "@/components/ConfirmModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ATTENDANCE, PROCESS_STATUS } from "@/lib/enums";

export interface ApplicantProps {
    applicant: ApplicantResource;
    onMarkPresent?: (id: number) => void;
    onMarkAttended?: (id: number) => void;
}

const ApplicantInterviewCard = ({ applicant, onMarkPresent, onMarkAttended }: ApplicantProps) => {
    const router = useRouter();
    const confirmRef = useRef<BottomSheetModal>(null);

    const attendance = applicant.current_attendance;
    const attendanceStatus = (attendance?.status ?? "pending") as AttendanceStatus;
    const statusStyle = ATTENDANCE[attendanceStatus] ?? ATTENDANCE.pending;
    const processLabel =
        PROCESS_STATUS[applicant.process_status]?.label ?? applicant.process_status;

    const hasAttendance = !!attendance?.id;
    const canMarkPresent = attendanceStatus === "pending" && hasAttendance;
    const canMarkAttended = attendanceStatus === "present" && hasAttendance;
    const isReviewed = attendanceStatus === "attended";
    const isAbsent = attendanceStatus === "absent";

    const handleConfirmPresent = () => {
        confirmRef.current?.dismiss();
        if (attendance?.id) {
            onMarkPresent?.(attendance.id);
        }
    };

    return (
        <View className="bg-white rounded-3xl shadow-md shadow-black/5 overflow-hidden">
            {}
            <TouchableOpacity
                className="px-4 py-5 flex-row items-center gap-4 active:bg-gray-50"
                onPress={() => router.push(`/family-profile/${applicant.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${applicant.applicant_name}`}
            >
                {}
                <View
                    className={`h-16 w-16 rounded-2xl items-center justify-center shrink-0 ${statusStyle.iconBg}`}
                >
                    <Boxicon
                        name={statusStyle.icon}
                        size={28}
                        color={statusStyle.iconColor}
                    />
                </View>

                {}
                <View className="flex-1 gap-1">
                    <Text
                        className="font-bold text-gray-800 text-xl leading-tight"
                        numberOfLines={1}
                    >
                        {applicant.applicant_name || "Sin nombre"}
                    </Text>

                    <Text
                        className="text-gray-500 text-base font-medium"
                        numberOfLines={1}
                    >
                        {applicant.curp || "Sin CURP"}
                    </Text>

                    <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                        <Badge
                            className={`${statusStyle.bg} border-transparent px-3 py-1.5 rounded-full`}
                        >
                            <Text className={`${statusStyle.text} text-sm font-bold`}>
                                {statusStyle.label}
                            </Text>
                        </Badge>

                        <Badge className="bg-gray-100 border-transparent px-3 py-1.5 rounded-full">
                            <Text className="text-gray-500 text-sm font-medium">
                                {processLabel}
                            </Text>
                        </Badge>
                    </View>
                </View>

                <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
            </TouchableOpacity>

            {}
            <View className="border-t border-gray-100 px-4 py-3 flex-row items-center justify-between">
                {}
                <View className="flex-row items-center gap-1.5">
                    <Boxicon name="bx-barcode" size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm font-medium">
                        {attendance?.attendance_code || "Sin código"}
                    </Text>
                </View>

                {}
                {canMarkPresent ? (
                    <TouchableOpacity
                        onPress={() => confirmRef.current?.present()}
                        className="bg-primary px-4 py-2 rounded-2xl flex-row items-center gap-1.5 shadow-sm shadow-primary/30 active:opacity-80"
                        accessibilityRole="button"
                        accessibilityLabel="Marcar como presente"
                    >
                        <Boxicon name="bxs-check-circle" size={16} color="#ffffff" />
                        <Text className="text-white text-sm font-bold">Marcar Presente</Text>
                    </TouchableOpacity>
                ) : canMarkAttended ? (
                    <TouchableOpacity
                        onPress={() => {
                            if (attendance?.id != null) {
                                onMarkAttended?.(attendance.id);
                            }
                        }}
                        className="bg-primary px-4 py-2 rounded-2xl flex-row items-center gap-1.5 shadow-sm shadow-primary/30 active:opacity-80"
                        accessibilityRole="button"
                        accessibilityLabel="Marcar como asistió"
                    >
                        <Boxicon name="bxs-check-circle" size={16} color="#ffffff" />
                        <Text className="text-white text-sm font-bold">Marcar Asistió</Text>
                    </TouchableOpacity>
                ) : isReviewed ? (
                    <View className="flex-row items-center gap-1.5 px-1">
                        <Boxicon name="bxs-check-circle" size={16} color="#16a34a" />
                        <Text className="text-green-600 text-sm font-bold">Asistió - Revisado</Text>
                    </View>
                ) : isAbsent ? (
                    <View className="flex-row items-center gap-1.5 px-1">
                        <Boxicon name="bxs-x-circle" size={16} color="#dc2626" />
                        <Text className="text-red-600 text-sm font-bold">Ausente</Text>
                    </View>
                ) : (
                    <View className="flex-row items-center gap-1.5 px-1">
                        <Boxicon name="bx-file" size={16} color="#9ca3af" />
                        <Text className="text-gray-400 text-sm font-bold">Sin registro</Text>
                    </View>
                )}
            </View>

            {}
            <ConfirmModal
                ref={confirmRef}
                title={`¿Marcar como presente?`}
                description={`Se registrará la asistencia de ${applicant.applicant_name || "este aplicante"} manualmente.`}
                confirmLabel="Sí, Marcar Presente"
                confirmVariant="primary"
                onConfirm={handleConfirmPresent}
                onDismiss={() => confirmRef.current?.dismiss()}
            />
        </View>
    );
};

export default ApplicantInterviewCard;
