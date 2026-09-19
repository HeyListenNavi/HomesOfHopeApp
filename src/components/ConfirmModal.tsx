import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import BottomSheet from "@/components/BottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface ConfirmModalProps {
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant?: "danger" | "primary";
    onConfirm: () => void;
    onDismiss: () => void;
    ref?: React.Ref<BottomSheetModal>;
}

const ConfirmModal = ({
    title,
    description,
    confirmLabel,
    confirmVariant = "primary",
    onConfirm,
    onDismiss,
    ref,
}: ConfirmModalProps) => {
    const isDanger = confirmVariant === "danger";

    return (
            <BottomSheet ref={ref} scrollable={false}>
                <View className="px-6 pb-4 gap-6">
                    {}
                    <View className="items-center gap-4 pt-2">
                        <View
                            className={`h-20 w-20 rounded-3xl items-center justify-center ${
                                isDanger ? "bg-red-50" : "bg-primary/10"
                            }`}
                        >
                            <Boxicon
                                name={isDanger ? "bxs-lock" : "bxs-info-circle"}
                                size={36}
                                color={isDanger ? "#dc2626" : "#61b346"}
                            />
                        </View>

                        <View className="items-center gap-1.5">
                            <Text className="font-bold text-gray-800 text-2xl text-center leading-tight">
                                {title}
                            </Text>
                            <Text className="text-gray-500 text-base font-medium text-center leading-relaxed">
                                {description}
                            </Text>
                        </View>
                    </View>

                    {}
                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={onConfirm}
                            className={`h-[56px] rounded-3xl flex-row items-center justify-center gap-2 active:opacity-80 ${
                                isDanger
                                    ? "bg-red-500 shadow-lg shadow-red-500/30"
                                    : "bg-primary shadow-lg shadow-primary/30"
                            }`}
                            accessibilityRole="button"
                            accessibilityLabel={confirmLabel}
                        >
                            <Text className="text-white font-bold text-base">
                                {confirmLabel}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onDismiss}
                            className="py-3.5 rounded-3xl items-center justify-center active:opacity-70"
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar"
                        >
                            <Text className="text-gray-500 font-bold text-base">
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>
        );
};

export default ConfirmModal;
