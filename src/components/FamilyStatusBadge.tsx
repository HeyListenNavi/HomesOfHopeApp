import React from "react";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { FAMILY_STATUS } from "@/lib/enums";
import { FamilyStatus } from "@/services/generated/apiTypes";

interface StatusStyle {
    label: string;
    bg: string;
    text: string;
}

const getStatusStyle = (status: FamilyStatus | ""): StatusStyle => {
    const meta = status ? FAMILY_STATUS[status] : undefined;
    return {
        label: meta?.label ?? status,
        bg: meta?.bg ?? "bg-gray-100",
        text: meta?.text ?? "text-gray-600",
    };
};

export const getStatusLabel = (status: FamilyStatus | ""): string => getStatusStyle(status).label;

interface FamilyStatusBadgeProps {
    status: FamilyStatus | "";
}

const FamilyStatusBadge = ({ status }: FamilyStatusBadgeProps) => {
    const style = getStatusStyle(status);
    return (
        <Badge className={`${style.bg} border-transparent px-3 py-1.5 rounded-full`}>
            <Text className={`${style.text} text-sm font-bold`}>{style.label}</Text>
        </Badge>
    );
};

export default FamilyStatusBadge;