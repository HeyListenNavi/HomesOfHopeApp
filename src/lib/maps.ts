const CARTO_API_KEY = process.env.EXPO_PUBLIC_CARTO_API_KEY;

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