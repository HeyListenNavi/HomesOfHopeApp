import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import {
    Permission,
    hasPermission,
    hasAnyPermission,
    hasEveryPermission,
} from "@/lib/permissions";

export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);

    return {
        permissions,
        isLoaded: Boolean(user),
        can: (permission: string) => hasPermission(permissions, permission),
        canAny: (...list: string[]) => hasAnyPermission(permissions, list),
        canAll: (...list: string[]) => hasEveryPermission(permissions, list),
    };
}

export { Permission };