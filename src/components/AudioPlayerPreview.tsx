import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { View, TouchableOpacity } from "react-native";
import Boxicon from "./Boxicons"; 
import { Text } from "@/components/ui/text"; 

const AudioPlayerPreview = ({
    uri,
    onClear,
    title = "Nota de voz",
}: {
    uri: string;
    onClear: () => void;
    title?: string;
}) => {
    const player = useAudioPlayer(uri);
    const status = useAudioPlayerStatus(player);

    const handlePlayPause = () => {
        if (player.playing) {
            player.pause();
        } else {
            player.seekTo(0);
            player.play();
        }
    };

    return (
        <View className="flex-row items-center bg-white p-3 rounded-2xl shadow-md shadow-black/5 gap-3">
            <TouchableOpacity
                onPress={handlePlayPause}
                className="bg-primary/10 h-12 w-12 rounded-full items-center justify-center"
            >
                <Boxicon
                    name={player.playing ? "bxs-pause" : "bxs-play"}
                    size={24}
                    color="#61b346"
                />
            </TouchableOpacity>

            <View className="flex-1">
                <Text className="font-bold text-gray-700">{title}</Text>
                <Text className="text-sm text-gray-400">
                    {status.duration
                        ? `${status.duration.toFixed(0)}s`
                        : "Cargando..."}{" "}
                </Text>
            </View>

            <TouchableOpacity onPress={onClear} className="p-2">
                <Boxicon name="bxs-trash" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
};

export default AudioPlayerPreview;
