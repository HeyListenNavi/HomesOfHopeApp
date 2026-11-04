import React, { useState } from "react";
import { View, TouchableOpacity, Modal, Keyboard } from "react-native";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import FluentEmoji from "@/components/FluentEmoji";
import { Badge } from "@/components/ui/badge";
import { formatTime, toLocalTimeString } from "@/lib/utils";

export interface TimePickerInputProps {
    label?: string;
    value: string;
    onChange: (time: string) => void;
    placeholder?: string;
    iconName?: BoxIconName | string;
    required?: boolean;
    optional?: boolean;
}

const HOURS_DATA = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1).padStart(2, "0"),
}));

const MINUTES_DATA = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, "0"),
}));

const PERIOD_DATA = [
    { value: "AM" as const, label: "AM" },
    { value: "PM" as const, label: "PM" },
];

const parseTimeParts = (timeStr: string) => {
    const [rawH, rawM] = (timeStr || toLocalTimeString()).split(":").map(Number);
    const h24 = isNaN(rawH) ? new Date().getHours() : rawH;
    const minute = isNaN(rawM) ? new Date().getMinutes() : rawM;
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return { hour12, minute, period };
};

const to24HourString = (hour12: number, minute: number, period: "AM" | "PM") => {
    let h24 = hour12 % 12;
    if (period === "PM") h24 += 12;
    return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const TimePickerInput = ({
    label,
    value,
    onChange,
    placeholder = "Selecciona una hora",
    iconName = "bxs-clock",
    required = false,
}: TimePickerInputProps) => {
    const [visible, setVisible] = useState(false);
    const [pickerKey, setPickerKey] = useState(0);

    const initialParts = parseTimeParts(value);
    const [wheelHour, setWheelHour] = useState<number>(initialParts.hour12);
    const [wheelMinute, setWheelMinute] = useState<number>(initialParts.minute);
    const [wheelPeriod, setWheelPeriod] = useState<"AM" | "PM">(initialParts.period);

    const [tempHour, setTempHour] = useState<number>(initialParts.hour12);
    const [tempMinute, setTempMinute] = useState<number>(initialParts.minute);
    const [tempPeriod, setTempPeriod] = useState<"AM" | "PM">(initialParts.period);

    const tempTimeStr = to24HourString(tempHour, tempMinute, tempPeriod);

    const handleOpen = () => {
        Keyboard.dismiss();
        const parts = parseTimeParts(value || toLocalTimeString());
        setWheelHour(parts.hour12);
        setWheelMinute(parts.minute);
        setWheelPeriod(parts.period);
        setTempHour(parts.hour12);
        setTempMinute(parts.minute);
        setTempPeriod(parts.period);
        setPickerKey((k) => k + 1);
        setVisible(true);
    };

    const handleNow = () => {
        const parts = parseTimeParts(toLocalTimeString());
        setWheelHour(parts.hour12);
        setWheelMinute(parts.minute);
        setWheelPeriod(parts.period);
        setTempHour(parts.hour12);
        setTempMinute(parts.minute);
        setTempPeriod(parts.period);
        setPickerKey((k) => k + 1);
    };

    const handleConfirm = () => {
        onChange(to24HourString(tempHour, tempMinute, tempPeriod));
        setVisible(false);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const displayValue = value ? formatTime(value) : null;

    return (
        <View className="gap-2">
            {label ? (
                <View className="flex-row items-start justify-between gap-2 px-1">
                    <Text className="text-base font-bold text-gray-700 flex-1 shrink leading-snug">
                        {label}
                        {required ? <Text className="text-red-500 font-black text-base"> *</Text> : null}
                    </Text>
                </View>
            ) : null}

            <TouchableOpacity
                onPress={handleOpen}
                className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 gap-3 min-h-[60px] active:bg-gray-100"
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${label ?? "Hora"}: ${displayValue ?? placeholder}`}
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
                        <View className="items-center gap-1.5 pt-1">
                            <FluentEmoji emoji="⏰" className="text-4xl mb-1" />
                            <Text className="font-bold text-gray-800 text-2xl text-center leading-tight">
                                Seleccionar Hora
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <Badge className="bg-gray-100 border-transparent px-3 py-1 rounded-full">
                                    <Text className="text-gray-700 font-bold text-sm">
                                        {formatTime(tempTimeStr)}
                                    </Text>
                                </Badge>
                                <TouchableOpacity
                                    onPress={handleNow}
                                    className="bg-primary/10 px-3 py-1 rounded-full active:bg-primary/20"
                                    accessibilityRole="button"
                                    accessibilityLabel="Seleccionar hora actual"
                                >
                                    <Text className="text-primary font-bold text-sm">Ahora</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {visible ? (
                            <View
                                key={pickerKey}
                                className="bg-gray-50 p-2 rounded-3xl overflow-hidden flex-row items-center justify-center border border-gray-100"
                            >
                                <WheelPicker
                                    data={HOURS_DATA}
                                    value={wheelHour}
                                    onValueChanging={({ item }) => setTempHour(item.value)}
                                    onValueChanged={({ item }) => {
                                        setTempHour(item.value);
                                        setWheelHour(item.value);
                                    }}
                                    width={80}
                                    itemHeight={48}
                                    visibleItemCount={5}
                                    enableScrollByTapOnItem
                                    itemTextStyle={{
                                        fontSize: 17,
                                        color: "#1f2937",
                                    }}
                                    overlayItemStyle={{
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        borderRadius: 0,
                                        borderTopLeftRadius: 16,
                                        borderBottomLeftRadius: 16,
                                        borderTopWidth: 0,
                                        borderBottomWidth: 0,
                                    }}
                                />
                                <WheelPicker
                                    data={MINUTES_DATA}
                                    value={wheelMinute}
                                    onValueChanging={({ item }) => setTempMinute(item.value)}
                                    onValueChanged={({ item }) => {
                                        setTempMinute(item.value);
                                        setWheelMinute(item.value);
                                    }}
                                    width={80}
                                    itemHeight={48}
                                    visibleItemCount={5}
                                    enableScrollByTapOnItem
                                    itemTextStyle={{
                                        fontSize: 17,
                                        color: "#1f2937",
                                    }}
                                    overlayItemStyle={{
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        borderRadius: 0,
                                        borderTopWidth: 0,
                                        borderBottomWidth: 0,
                                    }}
                                />
                                <WheelPicker
                                    data={PERIOD_DATA}
                                    value={wheelPeriod}
                                    onValueChanging={({ item }) => setTempPeriod(item.value)}
                                    onValueChanged={({ item }) => {
                                        setTempPeriod(item.value);
                                        setWheelPeriod(item.value);
                                    }}
                                    width={80}
                                    itemHeight={48}
                                    visibleItemCount={5}
                                    enableScrollByTapOnItem
                                    itemTextStyle={{
                                        fontSize: 17,
                                        color: "#1f2937",
                                    }}
                                    overlayItemStyle={{
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        borderRadius: 0,
                                        borderTopRightRadius: 16,
                                        borderBottomRightRadius: 16,
                                        borderTopWidth: 0,
                                        borderBottomWidth: 0,
                                    }}
                                />
                            </View>
                        ) : null}

                        <View className="gap-2.5 pt-1">
                            <TouchableOpacity
                                onPress={handleConfirm}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/30 active:opacity-90"
                                accessibilityRole="button"
                                accessibilityLabel="Confirmar Hora"
                            >
                                <Boxicon name="bxs-check-circle" size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-base">
                                    Confirmar Hora
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

export default TimePickerInput;
