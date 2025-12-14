import { useState, useEffect } from "react";
import { Alert } from "react-native";
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
} from "expo-audio";
import { File } from "expo-file-system";

export const useVoiceRecorder = () => {
    const [recordedUri, setRecordedUri] = useState<string | null>(null);

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    useEffect(() => {
        (async () => {
            console.log("Pidiendo permiso para utilizar el microfono");
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                console.error("Error obteniendo el permiso");
                Alert.alert(
                    "Permiso requerido",
                    "Se requiere acceso al micrófono."
                );
            }
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();
    }, []);

    const deleteFile = (uri: string) => {
        console.log("Borrando el audio");
        try {
            const file = new File(uri);
            file.delete();
            console.log("Se ha borrado el audio");
        } catch (error) {
            Alert.alert("Error", "No se ha podido eliminar el audio");
            console.error("Error eliminando archivo:", error);
        }
    };

    const startRecording = async () => {
        try {
            if (recordedUri) {
                deleteFile(recordedUri);
                setRecordedUri(null);
                console.log("Se borro el archivo existente");
            }

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
            console.log("Se comenzo a grabar");
        } catch (error) {
            Alert.alert("Error", "No se ha podido comenzar a grabar");
            console.error("Error al iniciar grabación:", error);
        }
    };

    const stopRecording = async () => {
        try {
            await audioRecorder.stop();
            setRecordedUri(audioRecorder.uri);
            console.log("Se ha guardado el audio");
        } catch (error) {
            console.error("Error al detener:", error);
            Alert.alert("Error", "No se ha podido guardar el audio");
        }
    };

    const discardRecording = () => {
        if (recordedUri) {
            deleteFile(recordedUri);
            setRecordedUri(null);
        }
    };

    return {
        recordedUri,
        isRecording: recorderState.isRecording,
        duration: Math.round(recorderState.durationMillis / 1000),
        startRecording,
        stopRecording,
        discardRecording,
    };
};
