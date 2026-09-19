// eslint-disable-next-line @typescript-eslint/no-var-requires
const { OpenLocationCode } = require("open-location-code") as {
    OpenLocationCode: new () => {
        encode: (lat: number, lng: number, length?: number) => string;
        decode: (code: string) => {
            latitudeCenter: number;
            longitudeCenter: number;
            latitudeLo: number;
            latitudeHi: number;
            longitudeLo: number;
            longitudeHi: number;
        };
        shorten: (fullCode: string, refLat: number, refLng: number) => string;
        recoverNearest: (
            shortCode: string,
            refLat: number,
            refLng: number
        ) => string;
        isValid: (code: string) => boolean;
        isFull: (code: string) => boolean;
        isShort: (code: string) => boolean;
    };
};

const olc = new OpenLocationCode();

const DEFAULT_REF_LAT = 32.5225;
const DEFAULT_REF_LNG = -117.0466;


export function parseCoordinates(
    lat?: number | string | null,
    lng?: number | string | null,
    mapsUrl?: string | null
): { latitude: number; longitude: number } | null {
    if (
        lat !== undefined &&
        lat !== null &&
        lng !== undefined &&
        lng !== null &&
        !isNaN(Number(lat)) &&
        !isNaN(Number(lng))
    ) {
        return {
            latitude: Number(lat),
            longitude: Number(lng),
        };
    }

    if (mapsUrl) {
        try {
            
            const qMatch = mapsUrl.match(/[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
            if (qMatch && qMatch[1] && qMatch[2]) {
                return {
                    latitude: parseFloat(qMatch[1]),
                    longitude: parseFloat(qMatch[2]),
                };
            }

            const atMatch = mapsUrl.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
            if (atMatch && atMatch[1] && atMatch[2]) {
                return {
                    latitude: parseFloat(atMatch[1]),
                    longitude: parseFloat(atMatch[2]),
                };
            }
        } catch {
            return null;
        }
    }

    return null;
}


export function getPlusCodeForCoords(
    latitude: number,
    longitude: number
): string | null {
    try {
        const fullCode = olc.encode(latitude, longitude, 11);
        return olc.shorten(fullCode, DEFAULT_REF_LAT, DEFAULT_REF_LNG);
    } catch {
        return null;
    }
}


export function decodePlusCode(
    code: string,
    refLat: number = DEFAULT_REF_LAT,
    refLng: number = DEFAULT_REF_LNG
): { latitude: number; longitude: number } | null {
    try {
        const cleaned = code.trim().split(" ")[0].toUpperCase();
        let fullCode = cleaned;

        if (olc.isShort(cleaned)) {
            fullCode = olc.recoverNearest(cleaned, refLat, refLng);
        }

        if (olc.isValid(fullCode)) {
            const decoded = olc.decode(fullCode);
            return {
                latitude: decoded.latitudeCenter,
                longitude: decoded.longitudeCenter,
            };
        }
        return null;
    } catch {
        return null;
    }
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface GeocodedPlace {
    displayName: string;
    latitude: number;
    longitude: number;
    address?: string;
    colony?: string;
    city?: string;
}


function parseGoogleAddressComponents(components: any[]): {
    address?: string;
    colony?: string;
    city?: string;
} {
    let streetNumber = "";
    let route = "";
    let colony = "";
    let city = "";

    for (const comp of components || []) {
        const types = comp.types || [];
        if (types.includes("street_number")) {
            streetNumber = comp.long_name;
        } else if (types.includes("route")) {
            route = comp.long_name;
        } else if (
            types.includes("sublocality_level_1") ||
            types.includes("neighborhood") ||
            types.includes("sublocality")
        ) {
            if (!colony) colony = comp.long_name;
        } else if (
            types.includes("locality") ||
            types.includes("administrative_area_level_2")
        ) {
            if (!city) city = comp.long_name;
        }
    }

    const fullStreet = route
        ? streetNumber
            ? `${route} #${streetNumber}`
            : route
        : undefined;

    return {
        address: fullStreet,
        colony: colony || undefined,
        city: city || undefined,
    };
}


export async function reverseGeocode(
    latitude: number,
    longitude: number
): Promise<{ address?: string; colony?: string; city?: string } | null> {
    
    if (GOOGLE_MAPS_API_KEY) {
        try {
            const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=es`;
            const res = await fetch(googleUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "OK" && data.results?.[0]) {
                    const topResult = data.results[0];
                    const parsed = parseGoogleAddressComponents(topResult.address_components);
                    const streetFromFormatted = topResult.formatted_address?.split(",")?.[0]?.trim();
                    const addr = parsed.address || streetFromFormatted || undefined;

                    if (addr || parsed.colony || parsed.city) {
                        return {
                            address: addr,
                            colony: parsed.colony,
                            city: parsed.city,
                        };
                    }
                }
            }
        } catch {
            
        }
    }

    
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "HomesOfHopeApp/1.0",
            },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const addr = data.address || {};

        const road = addr.road || addr.pedestrian || addr.footway || "";
        const houseNumber = addr.house_number ? ` #${addr.house_number}` : "";
        const fullStreet = road
            ? `${road}${houseNumber}`
            : data.display_name?.split(",")?.[0]?.trim() || "";

        const colony =
            addr.neighbourhood ||
            addr.suburb ||
            addr.residential ||
            addr.quarter ||
            "";
        const city =
            addr.city || addr.town || addr.municipality || addr.county || "";

        return {
            address: fullStreet || undefined,
            colony: colony || undefined,
            city: city || undefined,
        };
    } catch {
        return null;
    }
}


export async function searchPlaces(
    query: string,
    limit: number = 5
): Promise<GeocodedPlace[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    
    const coordParts = trimmed.split(/[\s,]+/);
    if (
        coordParts.length === 2 &&
        !isNaN(Number(coordParts[0])) &&
        !isNaN(Number(coordParts[1]))
    ) {
        const lat = Number(coordParts[0]);
        const lng = Number(coordParts[1]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return [
                {
                    displayName: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                    latitude: lat,
                    longitude: lng,
                },
            ];
        }
    }

    
    if (trimmed.includes("+")) {
        const decoded = decodePlusCode(trimmed);
        if (decoded) {
            return [
                {
                    displayName: `Plus Code: ${trimmed}`,
                    latitude: decoded.latitude,
                    longitude: decoded.longitude,
                },
            ];
        }
    }

    
    if (GOOGLE_MAPS_API_KEY) {
        try {
            
            const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                trimmed
            )}&key=${GOOGLE_MAPS_API_KEY}&components=country:MX&bounds=32.3,-117.3|32.7,-116.6&language=es`;
            const res = await fetch(googleUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
                    return data.results.slice(0, limit).map((r: any) => {
                        const parsed = parseGoogleAddressComponents(r.address_components);
                        return {
                            displayName: r.formatted_address,
                            latitude: r.geometry.location.lat,
                            longitude: r.geometry.location.lng,
                            address: parsed.address,
                            colony: parsed.colony,
                            city: parsed.city,
                        };
                    });
                }
            }
        } catch {
            
        }
    }

    
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
            trimmed
        )}&limit=${limit}&lat=${DEFAULT_REF_LAT}&lon=${DEFAULT_REF_LNG}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();

        if (!data.features || !Array.isArray(data.features)) return [];

        return data.features.map((f: any) => {
            const props = f.properties || {};
            const coords = f.geometry?.coordinates || [DEFAULT_REF_LNG, DEFAULT_REF_LAT];
            const street = [props.street, props.housenumber]
                .filter(Boolean)
                .join(" ");
            const colony = props.district || props.suburb || props.locality;
            const city = props.city || props.town || props.state;
            const name = props.name || street || props.formatted;

            const display = [name, colony, city, props.country]
                .filter(Boolean)
                .join(", ");

            return {
                displayName: display || "Ubicación encontrada",
                latitude: coords[1],
                longitude: coords[0],
                address: street || name || undefined,
                colony: colony || undefined,
                city: city || undefined,
            };
        });
    } catch {
        return [];
    }
}





