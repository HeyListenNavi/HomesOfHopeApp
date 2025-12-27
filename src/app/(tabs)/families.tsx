import { View, ScrollView } from "react-native";
import React from "react";
import { Family, FamilyCard } from "@/components/FamilyCard";
import { Text } from "@/components/ui/text";

const recentFamilies: Family[] = [
    {
        id: 1,
        name: "Familia 1",
        location: "Ubicacion",
        image: "1",
        lastAttended: "Hace 123 tiempo",
        status: "Status",
    },
    {
        id: 2,
        name: "Familia 2",
        location: "Ubicacion",
        image: "1",
        lastAttended: "Hace 123 tiempo",
        status: "Status",
    },
    {
        id: 3,
        name: "Familia 3",
        location: "Ubicacion",
        image: "1",
        lastAttended: "Hace 123 tiempo",
        status: "Status",
    },
];

const Page = () => {
    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6 gap-6">
                <Text
                    variant="h3"
                    className="text-start font-bold text-gray-800"
                >
                    Perfiles
                </Text>

                <View className="gap-3">
                    {recentFamilies.map((family) => (
                        <FamilyCard key={family.id} family={family} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

export default Page;
