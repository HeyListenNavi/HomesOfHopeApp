import Constants from "expo-constants";
import { parseCoordinates } from "@/lib/geo";
import { FamilyProfileResource, VisitResource } from "@/services/generated/apiTypes";

const CARTO_API_KEY =
    process.env.EXPO_PUBLIC_CARTO_API_KEY ||
    Constants.expoConfig?.extra?.cartoApiKey;

const CARTO_VOYAGER_BASE_URL =
    "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png";

export const CARTO_TILE_URL = CARTO_API_KEY
    ? `${CARTO_VOYAGER_BASE_URL}?key=${CARTO_API_KEY}`
    : CARTO_VOYAGER_BASE_URL;

export const LIGHT_BASE_MAP_STYLE = [
    {
        elementType: "geometry",
        stylers: [{ color: "#f4f3f0" }],
    },
    {
        elementType: "labels",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#dbeafe" }],
    },
];

type MapsAddressSource = {
    land_address_link?: string | null;
    home_address_link?: string | null;
} | null
    | undefined;

export const getVisitMapsLink = (
    locationType: string | null | undefined,
    family: MapsAddressSource
): string | null => {
    if (!family) return null;

    const links =
        locationType === "land"
            ? [family.land_address_link, family.home_address_link]
            : [family.home_address_link, family.land_address_link];

    return links.find((link) => !!link) ?? null;
};

export interface VisitMapPoint {
    visit: VisitResource;
    familyName: string;
    pinType: "land" | "home";
    locationLabel: string;
    address: string | null;
    coords: { latitude: number; longitude: number } | null;
    mapsLink: string | null;
}

export const getVisitMapPoint = (visit: VisitResource): VisitMapPoint => {
    const family: FamilyProfileResource | undefined =
        (visit as any)?.family_profile ?? visit.familyProfile;

    const familyName = family?.family_name || "Visita Programada";
    const isLand = visit.location_type === "land";
    const pinType: "land" | "home" = isLand ? "land" : "home";
    const locationLabel =
        visit.location_type === "home"
            ? "Vivienda Actual"
            : visit.location_type === "land"
                ? "Terreno"
                : visit.location_type === "virtual"
                    ? "Virtual"
                    : visit.location_type || "Visita";

    const landCoords = family
        ? parseCoordinates(
              family.land_latitude,
              family.land_longitude,
              family.land_address_link
          )
        : null;

    const homeCoords = family
        ? parseCoordinates(
              family.home_latitude,
              family.home_longitude,
              family.home_address_link
          )
        : null;

    const landAddress = family
        ? [family.land_address, family.land_colony, family.land_city]
              .filter(Boolean)
              .join(", ") || null
        : null;

    const homeAddress = family
        ? [family.home_address, family.home_colony, family.home_city]
              .filter(Boolean)
              .join(", ") || null
        : null;

    const coords = isLand
        ? landCoords ?? homeCoords
        : homeCoords ?? landCoords;

    const address = isLand
        ? landAddress ?? homeAddress
        : homeAddress ?? landAddress;

    const mapsLink =
        getVisitMapsLink(visit.location_type, family) ??
        (coords
            ? `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
            : null);

    return {
        visit,
        familyName,
        pinType,
        locationLabel,
        address,
        coords,
        mapsLink,
    };
};