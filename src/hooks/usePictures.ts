import { deleteFile } from '@/lib/utils';
import { EVIDENCE_MAX_BYTES } from '@/lib/mediaCompression';
import { useFileCompression } from '@/hooks/useFileCompression';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Linking } from 'react-native';

export const usePictures = () => {
    const [pictures, setPictures] = useState<string[]>([]);
    const { compressImage, isCompressing } = useFileCompression();

    const pickPicture = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permiso requerido',
                'Se requiere acceso a la galería de imágenes.',
                [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cancelar', style: 'cancel' }]
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            for (const asset of result.assets) {
                await compressImage({
                    uri: asset.uri,
                    fileName: asset.fileName,
                    fileSize: asset.fileSize,
                    maxBytes: EVIDENCE_MAX_BYTES,
                    onSuccess: (compressed) => setPictures((prev) => [...prev, compressed.uri]),
                });
            }
        }
    };

    const takePicture = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permiso requerido',
                'Se requiere acceso a la cámara para tomar una foto.',
                [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cancelar', style: 'cancel' }]
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            for (const asset of result.assets) {
                await compressImage({
                    uri: asset.uri,
                    fileName: asset.fileName,
                    fileSize: asset.fileSize,
                    maxBytes: EVIDENCE_MAX_BYTES,
                    onSuccess: (compressed) => setPictures((prev) => [...prev, compressed.uri]),
                });
            }
        }
    };

    const removePicture = (uri: string) => {
        deleteFile(uri);
        setPictures((prev) => prev.filter((p) => p !== uri));
    };

    return {
        pickPicture,
        pictures,
        takePicture,
        removePicture,
        isCompressing,
    };
};
