import { addDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { Alert } from "react-native";
import { File } from "expo-file-system";
import { twMerge } from "tailwind-merge";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { OpenLocationCode } = require("open-location-code") as {
    OpenLocationCode: new () => {
        encode: (lat: number, lng: number, length?: number) => string;
        shorten: (fullCode: string, refLat: number, refLng: number) => string;
        recoverNearest: (
            shortCode: string,
            refLat: number,
            refLng: number
        ) => string;
    };
};

const olc = new OpenLocationCode();

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getPlusCode = (
    coordString: string | null | undefined,
): string | null => {
    if (!coordString) return null;

    const referenceLat = 32.5225;
    const referenceLng = -117.0466;

    try {
        const parts = coordString.split(",");
        if (parts.length !== 2) return null;

        const parseCoordinate = (str: string) => {
            const cleanStr = str.trim().toUpperCase();
            const numberValue = parseFloat(cleanStr.replace(/[^\d.]/g, ""));

            if (cleanStr.includes("S") || cleanStr.includes("W")) {
                return numberValue * -1;
            }
            return numberValue;
        };

        const lat = parseCoordinate(parts[0]);
        const lng = parseCoordinate(parts[1]);

        const fullCode = olc.encode(lat, lng, 11);

        return olc.shorten(fullCode, referenceLat, referenceLng);
    } catch (e) {
        console.error("Error generating Plus Code", e);
        return null;
    }
};

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