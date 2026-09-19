import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { formatDate } from "@/lib/utils";
import { NoteResource } from "@/services/generated/apiTypes";
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
    note: NoteResource;
    onPress: () => void;
}

const NoteCard = ({ note, onPress }: NoteCardProps) => {
    return (
        <TouchableOpacity
            className="bg-white border border-gray-100 px-4 py-6 rounded-3xl flex-row items-center shadow-sm shadow-black/5 active:bg-gray-50 gap-4"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Ver nota de ${note.author?.name ?? "Sin autor"}`}
        >
            <View className="h-16 w-16 bg-blue-50 rounded-2xl items-center justify-center shrink-0">
                <Boxicon name="bxs-note" size={28} color="#3b82f6" />
            </View>
            
            <View className="flex-1 gap-1">
                <Text className="font-bold text-gray-800 text-xl leading-tight" numberOfLines={1}>
                    {note.author?.name ?? "Sin autor"}
                </Text>
                
                <Text className="text-gray-500 text-base font-medium" numberOfLines={1}>
                    {note.content}
                </Text>
                
                <View className="flex-row items-center gap-2 mt-1">
                    <Badge className="bg-blue-50 px-3 py-1.5 rounded-full">
                        <Text className="text-blue-700 text-sm font-bold">
                            {formatDate(note.created_at)}
                        </Text>
                    </Badge>
                    {note.is_private && (
                        <Badge className="bg-red-50 px-3 py-1.5 rounded-full">
                            <Text className="text-red-600 font-bold text-sm">
                                Privada
                            </Text>
                        </Badge>
                    )}
                </View>
            </View>
            
            <Boxicon name="bx-chevron-right" size={32} color="#d1d5db" />
        </TouchableOpacity>
    );
};

export default NoteCard;
