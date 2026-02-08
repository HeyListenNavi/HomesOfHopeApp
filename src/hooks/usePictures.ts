import { deleteFile } from '@/lib/utils';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Linking } from 'react-native';

export const usePictures = () => {
    const [pictures, setPictures] = useState<string[]>([]);

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

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            result.assets.forEach((asset) => {
                setPictures((prev) => [...prev, asset.uri]);
            });
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

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            result.assets.forEach((asset) => {
                setPictures((prev) => [...prev, asset.uri]);
            });
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
    };
};