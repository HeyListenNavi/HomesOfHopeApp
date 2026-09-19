import React from "react";
import { View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheet from "@/components/BottomSheet";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { formatDate } from "@/lib/utils";
import { NoteResource } from "@/services/generated/apiTypes";
import { Badge } from "@/components/ui/badge";

interface NoteSheetProps {
    note: NoteResource | null;
    onDismiss: () => void;
    ref?: React.Ref<BottomSheetModal>;
}

const NoteSheet = ({
    note,
    onDismiss,
    ref,
}: NoteSheetProps) => {
    return (
            <BottomSheet ref={ref} snapPoints={["45%", "75%"]} onDismiss={onDismiss}>
                {note && (
                    <View className="px-6 pt-2 pb-8 gap-5">
                        <View className="flex-row items-start gap-4">
                            <View className="h-16 w-16 bg-blue-50 rounded-3xl items-center justify-center shrink-0">
                                <Boxicon name="bxs-note" size={32} color="#3b82f6" />
                            </View>
                            <View className="flex-1 gap-1">
                                <Text className="text-3xl font-bold text-gray-800 leading-tight">
                                    {note.author?.name ?? "Sin autor"}
                                </Text>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-gray-500 text-lg font-medium">
                                        {formatDate(note.created_at)}
                                    </Text>
                                    {note.is_private && (
                                        <Badge className="bg-red-50 border border-red-100 px-3 py-0.5 rounded-full">
                                            <Text className="text-red-600 font-bold text-sm uppercase tracking-widest">
                                                Privada
                                            </Text>
                                        </Badge>
                                    )}
                                </View>
                            </View>
                        </View>

                        <View className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-sm shadow-black/5 mt-2">
                            <Text className="text-gray-700 text-lg leading-relaxed">
                                {note.content}
                            </Text>
                        </View>
                    </View>
                )}
            </BottomSheet>
        );
};

export default NoteSheet;
