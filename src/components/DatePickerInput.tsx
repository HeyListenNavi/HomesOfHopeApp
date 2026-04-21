import React, { useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";

interface DatePickerInputProps {
    label?: string;
    value: string; // ISO YYYY-MM-DD
    onChange: (date: string) => void;
    placeholder?: string;
    iconName?: string;
    maximumDate?: Date;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "Selecciona una fecha",
    iconName = "bxs-calendar",
    maximumDate,
}) => {
    const [show, setShow] = useState(false);

    const parsedDate = value ? new Date(value + "T12:00:00") : new Date();

    const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
        setShow(Platform.OS === "ios"); // On Android, picker closes automatically
        if (selected) {
            const yyyy = selected.getFullYear();
            const mm = String(selected.getMonth() + 1).padStart(2, "0");
            const dd = String(selected.getDate()).padStart(2, "0");
            onChange(`${yyyy}-${mm}-${dd}`);
        }
    };

    const displayValue = value
        ? parsedDate.toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "long",
              year: "numeric",
          })
        : null;

    return (
        <View className="gap-1">
            {label && (
                <Text className="text-sm font-medium text-gray-500 mb-0.5">
                    {label}
                </Text>
            )}

            <TouchableOpacity
                onPress={() => setShow(true)}
                className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5 gap-3"
                activeOpacity={0.7}
            >
                <Boxicon name={iconName as any} size={20} color="#61b346" />
                <Text
                    className={
                        displayValue
                            ? "flex-1 text-gray-800 font-medium"
                            : "flex-1 text-gray-400"
                    }
                >
                    {displayValue ?? placeholder}
                </Text>
                <Boxicon name="bxs-chevron-down" size={16} color="#9ca3af" />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={parsedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleChange}
                    maximumDate={maximumDate}
                    locale="es-MX"
                />
            )}
        </View>
    );
};

export default DatePickerInput;
