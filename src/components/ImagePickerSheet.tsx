/**
 * ImagePickerSheet
 * A styled bottom-sheet modal offering options with icons and rounded design.
 * Uses @gorhom/bottom-sheet with enableDynamicSizing (no snapPoints needed).
 */
import React, { useCallback, useRef, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";

interface Option {
    label: string;
    icon: string;
    color?: string;
    danger?: boolean;
    onPress: () => void;
}

interface ImagePickerSheetProps {
    visible: boolean;
    onClose: () => void;
    options: Option[];
    title?: string;
}

const ImagePickerSheet = ({
    visible,
    onClose,
    options,
    title = "Seleccionar opción",
}: ImagePickerSheetProps) => {
    const sheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        if (visible) {
            sheetRef.current?.expand();
        } else {
            sheetRef.current?.close();
        }
    }, [visible]);

    const handleSheetChange = useCallback(
        (index: number) => {
            if (index === -1) onClose();
        },
        [onClose],
    );

    if (!visible) return null;

    return (
        <>
            {/* Backdrop */}
            <Pressable
                style={[StyleSheet.absoluteFill, styles.backdrop]}
                onPress={onClose}
            />

            <BottomSheet
                ref={sheetRef}
                index={0}
                enableDynamicSizing
                enablePanDownToClose
                onClose={onClose}
                onChange={handleSheetChange}
                backgroundStyle={styles.sheet}
                handleIndicatorStyle={styles.handle}
            >
                <BottomSheetView style={styles.content}>
                    <Text className="text-gray-500 text-sm font-medium text-center mb-4">
                        {title}
                    </Text>

                    <View className="gap-2">
                        {options.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    onClose();
                                    // Small delay to let sheet close first
                                    setTimeout(opt.onPress, 220);
                                }}
                                className={`flex-row items-center gap-4 px-5 py-4 rounded-2xl ${
                                    opt.danger ? "bg-red-50" : "bg-gray-50"
                                }`}
                                activeOpacity={0.7}
                            >
                                <View
                                    className={`w-11 h-11 rounded-xl items-center justify-center ${
                                        opt.danger ? "bg-red-100" : "bg-primary/10"
                                    }`}
                                >
                                    <Boxicon
                                        name={opt.icon as any}
                                        size={22}
                                        color={
                                            opt.danger
                                                ? "#ef4444"
                                                : opt.color ?? "#61b346"
                                        }
                                    />
                                </View>
                                <Text
                                    className={`font-semibold text-base ${
                                        opt.danger ? "text-red-500" : "text-gray-800"
                                    }`}
                                >
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={onClose}
                        className="mt-4 py-4 rounded-2xl bg-gray-100 items-center"
                        activeOpacity={0.7}
                    >
                        <Text className="font-semibold text-gray-500">
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheet>
        </>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1,
    },
    sheet: {
        borderRadius: 28,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
    },
    handle: {
        backgroundColor: "#d1d5db",
        width: 40,
        height: 4,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 36,
        paddingTop: 8,
        zIndex: 2,
    },
});

export default ImagePickerSheet;
