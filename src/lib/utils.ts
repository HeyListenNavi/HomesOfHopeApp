import { addDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { Alert } from "react-native";
import { File } from "expo-file-system";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const toLocalDateString = (
    input: Date | string = new Date(),
): string => {
    if (typeof input === "string") {
        const d = parseISO(input);
        return isNaN(d.getTime()) ? input : format(d, "yyyy-MM-dd");
    }
    return format(input, "yyyy-MM-dd");
};

export const getTomorrowLocalDateString = (): string =>
    toLocalDateString(addDays(new Date(), 1));

export const toLocalTimeString = (input: Date = new Date()): string =>
    format(input, "HH:mm");

export const toLocalDateTimeString = (input: Date = new Date()): string =>
    format(input, "yyyy-MM-dd HH:mm:ss");

export const formatTime = (timeString?: string | null): string => {
    if (!timeString) return "N/A";

    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "Hora inválida";

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return format(date, "h:mm a", { locale: es });
};

export const combineDateAndTime = (
    dateString: string,
    timeString: string,
): string => {
    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date(
        year,
        (month || 1) - 1,
        day || 1,
        hours || 0,
        minutes || 0,
        0,
        0,
    );
    return isNaN(date.getTime())
        ? format(new Date(), "yyyy-MM-dd HH:mm:ss")
        : format(date, "yyyy-MM-dd HH:mm:ss");
};

const DEFAULT_DATE_FORMAT = "d MMM yyyy";
const DEFAULT_DATE_TIME_FORMAT = "d MMM yyyy, h:mm a";

export const formatDate = (
    dateString?: string | null,
    formatString = DEFAULT_DATE_FORMAT,
) => {
    if (!dateString) return "N/A";

    const date = parseISO(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";

    return format(date, formatString, { locale: es });
};

export const formatDateTime = (dateString?: string | null) =>
    formatDate(dateString, DEFAULT_DATE_TIME_FORMAT);

export const deleteFile = (uri: string) => {
    try {
        const file = new File(uri);
        file.delete();
    } catch (error) {
        Alert.alert("Error", "No se ha podido eliminar el archivo");
    }
};