import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";

export function usePermissionGuard(permission: string) {
    const { isLoaded, can } = usePermissions();
    const router = useRouter();
    const deniedHandled = useRef(false);

    const allowed = isLoaded && can(permission);

    useEffect(() => {
        if (!isLoaded || allowed || deniedHandled.current) return;
        deniedHandled.current = true;
        router.back();
    }, [isLoaded, allowed, router]);

    return allowed;
}