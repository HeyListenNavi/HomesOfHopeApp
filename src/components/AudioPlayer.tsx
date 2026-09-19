import { useAudioPlayer, useAudioPlayerStatus, AudioPlayer as ExpoAudioPlayer } from "expo-audio";
import { View, TouchableOpacity, LayoutChangeEvent, GestureResponderEvent } from "react-native";
import { useState } from "react";
import Boxicon from "./Boxicons";
import { Text } from "@/components/ui/text";

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const r = total % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
};

interface AudioPlayerProps {
    uri?: string | null;
    player?: ExpoAudioPlayer;
    onDiscard?: () => void;
}

const AudioPlayer = ({ uri, player: externalPlayer, onDiscard }: AudioPlayerProps) => {
    
    
    const internalPlayer = useAudioPlayer(uri || "", { updateInterval: 50 });
    const activePlayer = externalPlayer || internalPlayer;
    const status = useAudioPlayerStatus(activePlayer);

    const [barWidth, setBarWidth] = useState(0);
    const [scrubRatio, setScrubRatio] = useState<number | null>(null);

    const duration = status.duration ?? 0;
    const rawCurrentTime = status.currentTime ?? 0;
    
    
    const displayRatio = scrubRatio !== null 
        ? scrubRatio 
        : (duration > 0 ? Math.min(rawCurrentTime / duration, 1) : 0);
    
    const displayTime = scrubRatio !== null ? scrubRatio * duration : rawCurrentTime;

    const handlePlayPause = () => {
        if (status.didJustFinish) {
            activePlayer.seekTo(0);
            activePlayer.play();
        } else if (status.playing) {
            activePlayer.pause();
        } else {
            activePlayer.play();
        }
    };

    const handleScrub = (e: GestureResponderEvent) => {
        if (barWidth <= 0 || duration <= 0) return;
        const ratio = Math.max(0, Math.min(e.nativeEvent.locationX / barWidth, 1));
        setScrubRatio(ratio);
    };

    const handleScrubRelease = (e: GestureResponderEvent) => {
        if (barWidth <= 0 || duration <= 0) {
            setScrubRatio(null);
            return;
        }
        const ratio = Math.max(0, Math.min(e.nativeEvent.locationX / barWidth, 1));
        activePlayer.seekTo(ratio * duration);
        setScrubRatio(null);
    };

    const seekRelative = (seconds: number) => {
        const newTime = Math.max(0, Math.min(rawCurrentTime + seconds, duration));
        activePlayer.seekTo(newTime);
    };

    if (!uri && !externalPlayer) return null;

    return (
        <View className="bg-gray-100 rounded-3xl p-4 w-full">
            {}
            {onDiscard && (
                <View className="items-end mb-1 -mt-1 -mr-1">
                    <TouchableOpacity
                        onPress={onDiscard}
                        className="p-1.5 bg-red-50 rounded-full active:bg-red-100"
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar audio"
                    >
                        <Boxicon name="bxs-trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            )}

            {}
            <View
                className="justify-center relative"
                style={{ height: 24 }}
                onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={handleScrub}
                onResponderMove={handleScrub}
                onResponderRelease={handleScrubRelease}
                onResponderTerminationRequest={() => false}
                accessibilityRole="adjustable"
                accessibilityValue={{
                    min: 0,
                    max: duration > 0 ? duration : 1,
                    now: displayTime,
                }}
            >
                {}
                <View className="h-2 bg-gray-300 rounded-full overflow-hidden w-full">
                    {}
                    <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${displayRatio * 100}%` }}
                    />
                </View>
                {}
                <View
                    className="absolute h-4 w-4 -ml-2 top-1/2 -mt-2 rounded-full bg-primary border-2 border-white shadow-sm shadow-primary/30"
                    style={{ left: `${displayRatio * 100}%` }}
                />
            </View>

            {}
            <View className="flex-row justify-between px-1 mt-1">
                <Text className="text-gray-800 text-sm font-bold">
                    {formatTime(displayTime)}
                </Text>
                <Text className="text-gray-500 text-sm font-medium">
                    {status.isLoaded && duration > 0 ? formatTime(duration) : "—"}
                </Text>
            </View>

            {}
            <View className="flex-row items-center justify-center mt-3">
                
                {}
                <View className="flex-row items-center justify-center" style={{ gap: 32 }}>
                    <TouchableOpacity
                        onPress={() => seekRelative(-5)}
                        className="items-center justify-center opacity-70 active:opacity-40"
                        style={{ width: 44, height: 44 }}
                    >
                        <Boxicon name="bxs-rewind" size={32} color="#374151" />
                        <Text className="text-gray-700 font-bold text-[10px] absolute -bottom-1">5s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handlePlayPause}
                        className="h-14 w-14 bg-primary rounded-full items-center justify-center shadow-md shadow-primary/30 active:opacity-80"
                        accessibilityRole="button"
                        accessibilityLabel={status.playing ? "Pausar audio" : "Reproducir audio"}
                    >
                        <Boxicon
                            name={status.playing ? "bxs-pause" : "bxs-play"}
                            size={36}
                            color="#ffffff"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => seekRelative(5)}
                        className="items-center justify-center opacity-70 active:opacity-40"
                        style={{ width: 44, height: 44 }}
                    >
                        <Boxicon name="bxs-fast-forward" size={32} color="#374151" />
                        <Text className="text-gray-700 font-bold text-[10px] absolute -bottom-1">5s</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default AudioPlayer;
