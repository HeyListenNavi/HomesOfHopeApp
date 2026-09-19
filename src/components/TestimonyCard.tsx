import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TestimonyCardProps {
    testimony: any;
    onPress: () => void;
}

const TestimonyCard = ({ testimony, onPress }: TestimonyCardProps) => {
    return (
        <TouchableOpacity
            className="bg-white border border-gray-100 px-4 py-6 rounded-3xl flex-row items-center shadow-sm shadow-black/5 active:bg-gray-50 gap-4"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Ver testimonio de ${testimony.recorder?.name ?? "Grabador"}`}
        >
            <View className="h-16 w-16 bg-amber-100 rounded-2xl items-center justify-center shrink-0">
                <Boxicon name="bxs-microphone" size={28} color="#d97706" />
            </View>
            
            <View className="flex-1 gap-1">
                <Text className="font-bold text-gray-800 text-xl leading-tight" numberOfLines={1}>
                    {testimony.recorder?.name ?? "Grabador"}
                </Text>
                
                <Text className="text-gray-500 text-base font-medium" numberOfLines={1}>
                    {testimony.summary}
                </Text>
                
                <View className="flex-row items-center gap-2 mt-1">
                    <Badge className="bg-amber-100 border-transparent px-3 py-1.5 rounded-full">
                        <Text className="text-amber-700 text-sm font-bold">
                            {formatDate(testimony.recorded_at)}
                        </Text>
                    </Badge>
                    {testimony.language && (
                        <Badge className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                            <Text className="text-gray-600 font-bold text-sm uppercase tracking-widest">
                                {testimony.language}
                            </Text>
                        </Badge>
                    )}
                </View>
            </View>
            
            <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
        </TouchableOpacity>
    );
};

export default TestimonyCard;
