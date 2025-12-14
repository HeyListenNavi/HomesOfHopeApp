import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { View, TouchableOpacity, Alert } from "react-native";
import { File } from "expo-file-system"; 
import Boxicon from "./Boxicons"; 
import { Text } from "~/components/ui/text"; 

const AudioPlayerPreview = ({
    uri,
    onClear, 
}: {
    uri: string;
    onClear: () => void;
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
        <View className="flex-row items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm gap-3">
            <TouchableOpacity
                onPress={handlePlayPause}
                className="bg-[#9BD189]/10 h-10 w-10 rounded-full items-center justify-center"
            >
                <Boxicon
                    name={player.playing ? "bxs-pause" : "bxs-play"}
                    size={24}
                    color="#61b346"
                />
            </TouchableOpacity>

            <View className="flex-1">
                <Text className="font-bold text-gray-700">Nota de voz</Text>
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
