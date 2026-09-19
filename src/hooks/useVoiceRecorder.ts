import { useState } from "react";
import { Alert, Linking } from "react-native";
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
} from "expo-audio";
import { deleteFile } from "@/lib/utils";

export const useVoiceRecorder = () => {
    const [recordedUri, setRecordedUri] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

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

    const discardRecording = () => {
        if (recordedUri) {
            deleteFile(recordedUri);
            setRecordedUri(null);
            setDuration(0);
        }
    };

    const recordingDuration = recorderState.isRecording
        ? recorderState.durationMillis
        : duration;

    return {
        recordedUri,
        isRecording: recorderState.isRecording,
        duration: Math.round(recordingDuration / 1000),
        startRecording,
        stopRecording,
        discardRecording,
        setRecordedUri,
    };
};