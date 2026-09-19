import React from "react";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { BoxIconName } from "@/components/Boxicons";

export interface RoleStyle {
    key: string;
    label: string;
    bg: string;
    text: string;
    icon: BoxIconName;
    iconBg: string;
    iconColor: string;
}

export const formatRoleLabel = (role?: string | null): string => {
    if (!role) return "Staff";
    const cleaned = role.trim().replace(/[_-]+/g, " ");
    return cleaned
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export const getRoleStyle = (role?: string | null): RoleStyle => {
    const label = formatRoleLabel(role);
    const key = role ? role.toLowerCase().trim().replace(/[\s-]+/g, "_") : "staff";
    return {
        key,
        label,
        bg: "bg-primary/10",
        text: "text-primary",
        icon: "bxs-user",
        iconBg: "bg-gray-100",
        iconColor: "#6b7280",
    };
};

interface RoleChipProps {
    role?: string | null;
}

const RoleChip = ({ role }: RoleChipProps) => {
    const roleStyle = getRoleStyle(role);
    return (
        <Badge className={`${roleStyle.bg} border-transparent px-3 py-1.5 rounded-full`}>
            <Text className={`${roleStyle.text} text-sm font-bold`}>{roleStyle.label}</Text>
        </Badge>
    );
};

export default RoleChip;