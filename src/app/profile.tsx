import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Boxicon from "@/components/Boxicons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";

const user = {
    name: "Usuario",
    role: "Rol",
    status: "Active",
    email: "usuario@ywamsdb.org",
    phoneNumber: "+52 123 456 7890",
    joinedAt: "Jan 12, 2023",
    photoUrl: "https://i.pravatar.cc/300?img=47",
};

const Page = () => {
    const router = useRouter();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-4 z-10">
                <View className="bg-white rounded-3xl gap-4 p-6 items-center">
                    <View className="relative">
                        <View className="p-1.5 bg-white rounded-full">
                            <Avatar className="w-28 h-28" alt={""}>
                                {user.photoUrl ? (
                                    <AvatarImage
                                        source={{ uri: user.photoUrl }}
                                    />
                                ) : (
                                    <AvatarFallback className="items-center justify-center">
                                        <Boxicon
                                            name="bxs-user"
                                            size={48}
                                            color="#61b346"
                                        />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </View>

                        <TouchableOpacity className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#61b346] items-center justify-center">
                            <Boxicon
                                name="bxs-camera"
                                size={18}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text className="text-center text-xl font-bold text-slate-800">
                            {user.name}
                        </Text>
                        <Text className="text-center text-slate-500">
                            {user.role}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0fdf4]">
                        <View className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                        <Text className="text-sm font-medium text-[#16a34a]">
                            {user.status}
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
                                {user.email}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-4 px-5 py-4 border-b border-slate-50">
                        <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                            <Boxicon
                                name="bxs-phone"
                                size={18}
                                color="#64748b"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs uppercase tracking-wide text-slate-400">
                                Phone
                            </Text>
                            <Text className="font-medium text-slate-800">
                                {user.phoneNumber}
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
                                Joined
                            </Text>
                            <Text className="font-medium text-slate-800">
                                {user.joinedAt}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="px-4 mt-6 gap-3">
                <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-2xl px-5 py-4">
                    <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                            <Boxicon
                                name="bxs-lock"
                                size={18}
                                color="#61b346"
                            />
                        </View>
                        <Text className="flex-1 font-medium text-slate-800">
                            Change Password
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center justify-between bg-white rounded-2xl px-5 py-4"
                    onPress={() => router.replace("/login")}
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
                            Log Out
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Page;
