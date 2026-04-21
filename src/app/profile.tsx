import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Boxicon from "@/components/Boxicons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useAuth";

const Page = () => {
    const router = useRouter();
    const authStore = useAuthStore();

    // Use the cached user from the store first; refresh with the API in background
    const storedUser = authStore.user;
    const { data: fetchedUser, isLoading } = useCurrentUser(!!authStore.token);
    const user = fetchedUser ?? storedUser;

    const handleLogout = () => {
        authStore.logout();
        router.replace("/login");
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-4 z-10">
                <View className="bg-white rounded-3xl gap-4 p-6 items-center">
                    <View className="relative">
                        <View className="p-1.5 bg-white rounded-full">
                            <Avatar className="w-28 h-28" alt={""}>
                                <AvatarFallback className="items-center justify-center">
                                    <Boxicon
                                        name="bxs-user"
                                        size={48}
                                        color="#61b346"
                                    />
                                </AvatarFallback>
                            </Avatar>
                        </View>
                    </View>

                    <View>
                        {isLoading && !user ? (
                            <ActivityIndicator color="#61b346" />
                        ) : (
                            <>
                                <Text className="text-center text-xl font-bold text-slate-800">
                                    {user?.name ?? "—"}
                                </Text>
                                <Text className="text-center text-slate-500">
                                    {user?.email ?? "—"}
                                </Text>
                            </>
                        )}
                    </View>

                    <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0fdf4]">
                        <View className="w-2 h-2 rounded-full bg-[#16a34a]" />
                        <Text className="text-sm font-medium text-[#16a34a]">
                            Activo
                        </Text>
                    </View>
                </View>
            </View>

            <View className="px-4 mt-6">
                <View className="bg-white rounded-3xl overflow-hidden">
                    <View className="flex-row items-center gap-4 px-5 py-4 border-b border-slate-50">
                        <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                            <Boxicon
                                name="bxs-envelope"
                                size={18}
                                color="#64748b"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs uppercase tracking-wide text-slate-400">
                                Email
                            </Text>
                            <Text className="font-medium text-slate-800">
                                {user?.email ?? "—"}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-4 px-5 py-4">
                        <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                            <Boxicon
                                name="bxs-calendar"
                                size={18}
                                color="#64748b"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs uppercase tracking-wide text-slate-400">
                                Miembro desde
                            </Text>
                            <Text className="font-medium text-slate-800">
                                {formatDate(user?.created_at)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="px-4 mt-6 gap-3">
                <TouchableOpacity
                    className="flex-row items-center justify-between bg-white rounded-2xl px-5 py-4"
                    onPress={handleLogout}
                >
                    <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
                            <Boxicon
                                name="bxs-arrow-out-right-square-half"
                                size={18}
                                color="#dc2626"
                            />
                        </View>
                        <Text className="flex-1 font-medium text-red-600">
                            Cerrar Sesión
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Page;
