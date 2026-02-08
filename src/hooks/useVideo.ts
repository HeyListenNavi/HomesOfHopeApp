import { useState } from "react";
import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { deleteFile } from "@/lib/utils";

export const useVideo = () => {
    const [video, setVideo] = useState<string | null>(null);

    const pickVideo = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permiso requerido',
                'Se requiere acceso a la galería para seleccionar un video.',
                [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cancelar', style: 'cancel' }]
            );
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsMultipleSelection: false,
            allowsEditing: false,
            videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
            videoMaxDuration: 180,
        });

        if (!result.canceled) {
            setVideo(result.assets[0].uri   );
        }
    };

    const recordVideo = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permiso requerido',
                'Se requiere acceso a la cámara para grabar un video.',
                [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cancelar', style: 'cancel' }]
            );
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'],
            allowsMultipleSelection: false,
            allowsEditing: false,
            videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
            videoMaxDuration: 180,
        });

        if (!result.canceled) {
            setVideo(result.assets[0].uri);
        }
    };

    const discardVideo = () => {
        deleteFile(video ?? "");
        setVideo(null);
    }

    return {
        video,
        pickVideo,
        recordVideo,
        discardVideo,
    };
};