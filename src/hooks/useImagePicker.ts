import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { Alert } from "react-native";

export const useImagePicker = () => {
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const permissionResult =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            console.log("Pidiendo permiso a la libreria de imagenes");

            if (!permissionResult.granted) {
                console.error("No se ha podido obtener el permiso");
                Alert.alert(
                    "Permiso denegado",
                    "Necesitamos acceso a la galería."
                );
                return;
            }
        })();
    }, []);

    const pickImages = async () => {
        console.log("Seleccionando imagenes");
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            console.log("Guardando imagenes")
            const newUris = result.assets.map((asset) => {
                return asset.uri;
            });
            setImages((prev) => [...prev, ...newUris]);
            console.log("Se han guardado las imagenes");
        }
    };

    const removeImage = (indexToRemove: number) => {
        try {
            console.log("Borrando imagen");
            const uriToRemove = images[indexToRemove];
            const file = new File(uriToRemove);
            file.delete();

            setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
            console.log("Se ha borrado la imgen");
        } catch (error) {
            Alert.alert("Error", "No se ha podido borrar la imagen");
            console.error("Error al borrar imagen:", error);
        }
    };

    return {
        images,
        pickImages,
        removeImage,
        length: images.length,
    };
};
