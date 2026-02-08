import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioPlayer,
    useAudioPlayerStatus,
} from "expo-audio";
import { deleteFile } from "@/lib/utils";

export const useVoiceRecorder = () => {
    const [recordedUri, setRecordedUri] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);
    const player = useAudioPlayer(recordedUri);
    const playerStatus = useAudioPlayerStatus(player);

    const startRecording = async () => {
        const permissionResult = await AudioModule.requestRecordingPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permiso requerido',
                'Se requiere acceso al micrófono para grabar audio.',
                [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cancelar', style: 'cancel' }]
            );
            return;
        }

        setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: true,
            allowsBackgroundRecording: true,
            interruptionModeAndroid: "doNotMix",
        });

        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
    };

    const stopRecording = async () => {
        setDuration(recorderState.durationMillis);
        await audioRecorder.stop();
        setRecordedUri(audioRecorder.uri);
    };

    const togglePlayback = () => {
        if (!player) return;
        player.playing ? player.pause() : player.play();

        if (player.currentTime >= player.duration - 100) {
            player.seekTo(0);
        }
    };

    const resetPlayback = () => {
        if (player) {
            player.seekTo(0);
            player.pause();
        }
    }

    const discardRecording = () => {
        if (recordedUri) {
            deleteFile(recordedUri);
            setRecordedUri(null);
            setDuration(0);
        }
    };

    const currentDuration = recorderState.isRecording
        ? recorderState.durationMillis
        : duration;

    return {
        recordedUri,
        isRecording: recorderState.isRecording,
        duration: Math.round(currentDuration / 1000),
        startRecording,
        stopRecording,
        discardRecording,
        
        progress: playerStatus.duration > 0 ? (playerStatus.currentTime / playerStatus.duration) * 100 : 0,
        currentTime: Math.round(playerStatus.currentTime),
        isPlaying: playerStatus.playing,
        togglePlayback,
        resetPlayback,
    };
};