import React from "react";
import { View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheet from "@/components/BottomSheet";
import { Text } from "@/components/ui/text";
import Boxicon from "@/components/Boxicons";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "@/components/AudioPlayer";

interface TestimonySheetProps {
    testimony: any | null;
    onDismiss: () => void;
    ref?: React.Ref<BottomSheetModal>;
}

const TestimonySheet = ({
    testimony,
    onDismiss,
    ref,
}: TestimonySheetProps) => {
    return (
        <BottomSheet ref={ref} snapPoints={["55%", "85%"]} onDismiss={onDismiss}>
                {testimony && (
                    <View className="px-6 pt-2 pb-8 gap-5">
                        <View className="flex-row items-start gap-4">
                            <View className="h-16 w-16 bg-amber-100 rounded-3xl items-center justify-center shrink-0">
                                <Boxicon name="bxs-microphone" size={32} color="#d97706" />
                            </View>
                            <View className="flex-1 gap-1">
                                <Text className="text-3xl font-bold text-gray-800 leading-tight">
                                    {testimony.recorder?.name ?? "Grabador"}
                                </Text>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-gray-500 text-lg font-medium">
                                        {formatDate(testimony.recorded_at)}
                                    </Text>
                                    {testimony.language && (
                                        <Badge className="bg-gray-100 border border-gray-200 px-3 py-0.5 rounded-full">
                                            <Text className="text-gray-600 font-bold text-sm uppercase tracking-widest">
                                                {testimony.language}
                                            </Text>
                                        </Badge>
                                    )}
                                </View>
                            </View>
                        </View>

                        <Text className="text-gray-800 text-lg font-medium leading-relaxed">
                            {testimony.summary}
                        </Text>

                        {testimony.transcription && (
                            <View className="gap-3 mt-2">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-gray-400 text-base font-bold uppercase tracking-wider">
                                        Transcripción
                                    </Text>
                                    <Badge className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                        <Text className="text-gray-600 font-bold text-xs uppercase tracking-widest">
                                            {testimony.language ?? "es"}
                                        </Text>
                                    </Badge>
                                </View>
                                <View className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-sm shadow-black/5">
                                    <Text className="text-gray-600 text-base italic leading-relaxed">
                                        "{testimony.transcription}"
                                    </Text>
                                </View>
                            </View>
                        )}

                        {testimony.audio_url && (
                            <View className="mt-2">
                                <AudioPlayer uri={testimony.audio_url} />
                            </View>
                        )}
                    </View>
                )}
            </BottomSheet>
        );
};

export default TestimonySheet;
