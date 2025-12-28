import { clsx, type ClassValue } from "clsx";
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
