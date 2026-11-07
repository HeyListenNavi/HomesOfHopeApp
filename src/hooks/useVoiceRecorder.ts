import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    AudioQuality,
    IOSOutputFormat,
    RecordingOptions,
    setAudioModeAsync,
} from "expo-audio";
import { deleteFile } from "@/lib/utils";
import { MAX_AUDIO_DURATION_SECONDS } from "@/lib/mediaCompression";

const VOICE_RECORDING_PRESET: RecordingOptions = {
    extension: ".m4a",
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 64000,
    android: {
        outputFormat: "mpeg4",
        audioEncoder: "aac",
    },
    ios: {
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: AudioQuality.HIGH,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
    web: {
        mimeType: "audio/webm",
        bitsPerSecond: 64000,
    },
};

export const useVoiceRecorder = () => {
    const [recordedUri, setRecordedUri] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const autoStoppingRef = useRef(false);

    const audioRecorder = useAudioRecorder(VOICE_RECORDING_PRESET);
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

        autoStoppingRef.current = false;
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
    };

    const stopRecording = async () => {
        setDuration(recorderState.durationMillis);
        await audioRecorder.stop();
        setRecordedUri(audioRecorder.uri);
    };

    useEffect(() => {
        if (
            recorderState.isRecording &&
            recorderState.durationMillis >= MAX_AUDIO_DURATION_SECONDS * 1000 &&
            !autoStoppingRef.current
        ) {
            autoStoppingRef.current = true;
            stopRecording().then(() => {
                Alert.alert(
                    "Límite de grabación alcanzado",
                    `La grabación se detuvo automáticamente al alcanzar el límite máximo de ${Math.floor(MAX_AUDIO_DURATION_SECONDS / 60)} minutos.`
                );
            });
        }
    }, [recorderState.isRecording, recorderState.durationMillis]);

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
