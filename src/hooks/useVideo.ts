import { useState } from "react";
import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { deleteFile } from "@/lib/utils";
import { EVIDENCE_MAX_BYTES, MAX_VIDEO_DURATION_SECONDS } from "@/lib/mediaCompression";
import { useFileCompression } from "@/hooks/useFileCompression";

export const useVideo = () => {
    const [video, setVideo] = useState<string | null>(null);
    const { compressVideo, isCompressing, progress: compressionProgress } = useFileCompression();

    const pickVideo = async () => {
        if (isCompressing) return;

        const result = await DocumentPicker.getDocumentAsync({
            type: ["video/*"],
            copyToCacheDirectory: false,
        });

        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            await compressVideo({
                uri: asset.uri,
                fileName: asset.name,
                fileSize: asset.size,
                maxBytes: EVIDENCE_MAX_BYTES,
                maxDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
                onSuccess: (compressed) => setVideo(compressed.uri),
            });
        }
    };

    const recordVideo = async () => {
        if (isCompressing) return;

        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permiso requerido',
                'Se requiere acceso a la cámara para grabar un video.',
                [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cancelar', style: 'cancel' }]
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'],
            allowsMultipleSelection: false,
            allowsEditing: false,
            videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
            videoMaxDuration: MAX_VIDEO_DURATION_SECONDS,
        });

        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            await compressVideo({
                uri: asset.uri,
                fileName: asset.fileName,
                fileSize: asset.fileSize,
                durationMs: asset.duration,
                maxBytes: EVIDENCE_MAX_BYTES,
                maxDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
                onSuccess: (compressed) => setVideo(compressed.uri),
            });
        }
    };

    const discardVideo = () => {
        if (video) {
            deleteFile(video);
        }
        setVideo(null);
    };

    return {
        video,
        pickVideo,
        recordVideo,
        discardVideo,
        isCompressing,
        compressionProgress,
    };
};
