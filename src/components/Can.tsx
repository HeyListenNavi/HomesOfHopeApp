import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

type CanProps = {
    permission?: string;
    anyOf?: string[];
    allOf?: string[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

export default function Can({
    permission,
    anyOf,
    allOf,
    fallback = null,
    children,
}: CanProps) {
    const { isLoaded, can, canAny, canAll } = usePermissions();

    if (!isLoaded) return fallback ?? null;

    if (permission && !can(permission)) return fallback ?? null;
    if (anyOf?.length && !canAny(...anyOf)) return fallback ?? null;
    if (allOf?.length && !canAll(...allOf)) return fallback ?? null;

    return children;
}