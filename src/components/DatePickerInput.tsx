import React, { useState } from "react";
import { View, TouchableOpacity, Modal, Keyboard } from "react-native";
import { DatePicker } from "@quidone/react-native-wheel-picker";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import { Badge } from "@/components/ui/badge";
import { formatDate, toLocalDateString } from "@/lib/utils";
import { parseISO } from "date-fns";

export interface DatePickerInputProps {
    label?: string;
    value: string; 
    onChange: (date: string) => void;
    placeholder?: string;
    iconName?: BoxIconName | string;
    maximumDate?: Date;
    minimumDate?: Date;
    required?: boolean;
    optional?: boolean;
}

const DatePickerInput = ({
    label,
    value,
    onChange,
    placeholder = "Selecciona una fecha",
    iconName = "bxs-calendar",
    maximumDate,
    minimumDate,
    required = false,
    optional = false,
}: DatePickerInputProps) => {
    const [visible, setVisible] = useState(false);

    const todayLocal = toLocalDateString();
    const [tempDate, setTempDate] = useState<string>(toLocalDateString(value) || todayLocal);

    const maxDateStr = maximumDate ? toLocalDateString(maximumDate) : toLocalDateString();
    const minDateStr = minimumDate ? toLocalDateString(minimumDate) : "1920-01-01";

    const handleOpen = () => {
        Keyboard.dismiss();
        setTempDate(toLocalDateString(value) || todayLocal);
        setVisible(true);
    };

    const handleConfirm = () => {
        onChange(toLocalDateString(tempDate));
        setVisible(false);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const displayValue = value
        ? formatDate(toLocalDateString(value), "d 'de' MMMM 'de' yyyy")
        : null;

    return (
        <View className="gap-2">
            {label && (
                <View className="flex-row items-start justify-between gap-2 px-1">
                    <Text className="text-base font-bold text-gray-700 flex-1 shrink leading-snug">
                        {label}
                        {required && <Text className="text-red-500 font-black text-base"> *</Text>}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                onPress={handleOpen}
                className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 gap-3 min-h-[60px] active:bg-gray-100"
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${label ?? "Fecha"}: ${displayValue ?? placeholder}`}
            >
                <Boxicon name={iconName as any} size={22} color="#61b346" />
                <Text
                    className={
                        displayValue
                            ? "flex-1 text-gray-900 font-bold text-lg"
                            : "flex-1 text-gray-400 text-lg"
                    }
                >
                    {displayValue ?? placeholder}
                </Text>
                <Boxicon name="bxs-chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={handleCancel}
            >
                <View className="flex-1 bg-black/60 justify-center items-center p-6">
                    <View className="bg-white w-full max-w-sm rounded-3xl p-6 gap-5 shadow-2xl">
                        {}
                        <View className="items-center gap-1.5 pt-1">
                            <FluentEmoji emoji="📅" className="text-4xl mb-1" />
                            <Text className="font-bold text-gray-800 text-2xl text-center leading-tight">
                                Seleccionar Fecha
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <Badge className="bg-gray-100 border-transparent px-3 py-1 rounded-full">
                                    <Text className="text-gray-700 font-bold text-sm capitalize">
                                        {formatDate(toLocalDateString(tempDate), "d 'de' MMMM 'de' yyyy")}
                                    </Text>
                                </Badge>
                                <TouchableOpacity
                                    onPress={() => setTempDate(todayLocal)}
                                    className="bg-primary/10 px-3 py-1 rounded-full active:bg-primary/20"
                                    accessibilityRole="button"
                                    accessibilityLabel="Seleccionar fecha de hoy"
                                >
                                    <Text className="text-primary font-bold text-sm">Hoy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {}
                        <View className="bg-gray-50 p-2 rounded-3xl overflow-hidden items-center justify-center border border-gray-100">
                            <DatePicker
                                date={parseISO(tempDate) as any}
                                onDateChanged={({ date }) => setTempDate(toLocalDateString(date))}
                                minDate={parseISO(minDateStr) as any}
                                maxDate={parseISO(maxDateStr) as any}
                                locale="es"
                                itemHeight={48}
                                visibleItemCount={5}
                                enableScrollByTapOnItem
                                itemTextStyle={{
                                    fontSize: 17,
                                    color: "#1f2937",
                                    textTransform: "capitalize",
                                }}
                                overlayItemStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                                    borderRadius: 16,
                                    borderTopWidth: 0,
                                    borderBottomWidth: 0,
                                }}
                            />
                        </View>

                        {}
                        <View className="gap-2.5 pt-1">
                            <TouchableOpacity
                                onPress={handleConfirm}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                                accessibilityRole="button"
                                accessibilityLabel="Confirmar Fecha"
                            >
                                <Boxicon name="bxs-check-circle" size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-base">
                                    Confirmar Fecha
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCancel}
                                className="py-3 items-center justify-center active:opacity-70"
                                accessibilityRole="button"
                                accessibilityLabel="Cancelar"
                            >
                                <Text className="text-gray-500 font-bold text-base">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default DatePickerInput;
