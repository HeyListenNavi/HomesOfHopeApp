import { TouchableOpacity, View, Image, Linking, Alert } from "react-native";
import React from "react";
import Boxicon from "@/components/Boxicons";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import Textarea from "./Textarea";

interface DocumentPreviewerProps {
    label?: string;
    description?: string;
    needsReview?: boolean;
    url?: string; // <-- Propiedad agregada para evitar el error de TypeScript
}

const DocumentPreviewer = ({
    label = "Documento",
    description = "Descripción del documento",
    needsReview = false,
    url,
}: DocumentPreviewerProps) => {

    // Función para intentar abrir el documento (PDF, web, etc.) en el navegador o visor externo
    const openDocument = async () => {
        if (!url) return;
        
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "No hay una aplicación instalada que pueda abrir este enlace.");
            }
        } catch (error) {
            Alert.alert("Error", "Ocurrió un problema al intentar abrir el documento.");
        }
    };

    // Heurística simple para intentar adivinar si la URL apunta a una imagen
    const isImage = url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

    return (
        <Dialog>
            <View className="gap-3">
                <View>
                    <View className="flex-row gap-2 items-center">
                        <Boxicon name="bxs-file" color="#9ca3af" size={18} />
                        <Label className="py-0.5 text-gray-500 font-bold">
                            {label}
                        </Label>
                    </View>

                    {description && (
                        <Text className="text-gray-400 text-sm">
                            {description}
                        </Text>
                    )}
                </View>

                <DialogTrigger asChild>
                    {/* Nota: Cambié el h-96 a py-6 para que el botón de abrir no ocupe toda la pantalla */}
                    <TouchableOpacity className="bg-white items-center justify-center py-6 rounded-2xl border-2 border-gray-300 border-dashed">
                        <Boxicon
                            name="bxs-arrow-out-up-square-half"
                            size={32}
                            color="#61b346"
                        />
                        <Text className="text-primary text-center text-lg font-bold mt-2">
                            Abrir {label}
                        </Text>
                    </TouchableOpacity>
                </DialogTrigger>

                {needsReview && (
                    <View className="flex-row gap-2 bg-white rounded-2xl">
                        <View className="flex-1 flex-row gap-2">
                            <TouchableOpacity className="flex-1 bg-gray-100 px-2 py-4 rounded-2xl flex-row justify-center gap-2">
                                <Text className="text-gray-500">
                                    <Boxicon name="bxs-camera" size={24} />
                                </Text>
                            </TouchableOpacity>
                            <Dialog className="flex-1">
                                <DialogTrigger asChild>
                                    <TouchableOpacity className="bg-red-50 px-2 py-4 rounded-2xl flex-row justify-center gap-2">
                                        <Text className="text-red-500">
                                            <Boxicon
                                                name="bxs-x-circle"
                                                size={24}
                                            />
                                        </Text>
                                    </TouchableOpacity>
                                </DialogTrigger>

                                <DialogContent className="w-[90vw] max-w-none bg-white rounded-3xl px-6 py-8">
                                    <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                                        Rechazar documento
                                    </DialogTitle>

                                    <DialogDescription className="text-gray-500 text-center text-base">
                                        ¿Deseas Rechazar este documento?
                                    </DialogDescription>

                                    <Textarea
                                        label="Razon"
                                        iconName="bxs-x-circle"
                                        placeholder="Escribe aqui la razon..."
                                        value={"reason"}
                                        onChangeText={() => {}}
                                    />

                                    <DialogFooter className="flex-row justify-center gap-2 mt-4">
                                        <DialogClose asChild>
                                            <TouchableOpacity className="p-4 rounded-xl items-center justify-center bg-transparent">
                                                <Text className="text-gray-500 font-semibold">
                                                    Cancelar
                                                </Text>
                                            </TouchableOpacity>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <TouchableOpacity className="bg-red-500 p-4 rounded-xl items-center justify-center">
                                                <Text className="text-white font-bold">
                                                    Rechazar
                                                </Text>
                                            </TouchableOpacity>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </View>
                        <Dialog className="flex-1">
                            <DialogTrigger asChild>
                                <TouchableOpacity className="bg-primary px-2 py-4 rounded-2xl flex-row items-center justify-center gap-2">
                                    <Text className="text-white">
                                        <Boxicon
                                            name="bxs-check-circle"
                                            size={24}
                                        />
                                    </Text>
                                    <Text className="text-white font-bold">
                                        Aprobar
                                    </Text>
                                </TouchableOpacity>
                            </DialogTrigger>

                            <DialogContent className="w-[90vw] max-w-none bg-white rounded-3xl px-6 py-8">
                                <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                                    Aprobar documento
                                </DialogTitle>

                                <DialogDescription className="text-gray-500 text-center text-base">
                                    ¿Deseas aprobar este documento?
                                </DialogDescription>

                                <DialogFooter className="flex-row gap-2 justify-center mt-4">
                                    <DialogClose asChild>
                                        <TouchableOpacity className="p-4 rounded-xl bg-transparent">
                                            <Text className="text-gray-500 font-semibold">
                                                Cancelar
                                            </Text>
                                        </TouchableOpacity>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <TouchableOpacity className="bg-primary p-4 rounded-xl">
                                            <Text className="text-white font-bold">
                                                Aprobar
                                            </Text>
                                        </TouchableOpacity>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </View>
                )}
            </View>

            <DialogContent className="w-[90vw] max-w-none bg-white rounded-3xl px-6 py-8">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl text-primary font-bold text-center">
                        {label}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <View className="w-full h-96 bg-gray-100 rounded-xl border border-gray-200 items-center justify-center my-4 overflow-hidden">
                    {url ? (
                        isImage ? (
                            // Si es una imagen, se renderiza directamente en el modal
                            <Image 
                                source={{ uri: url }} 
                                className="w-full h-full" 
                                resizeMode="contain" 
                            />
                        ) : (
                            // Si es PDF/otro, se muestra un botón para salir de la app y abrirlo
                            <View className="items-center justify-center gap-4">
                                <Boxicon name="bxs-file-pdf" size={80} color="#9ca3af" />
                                <TouchableOpacity 
                                    onPress={openDocument}
                                    className="bg-primary px-6 py-3 rounded-xl flex-row items-center gap-2"
                                >
                                    <Text className="text-white font-bold">Abrir Archivo Externamente</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View className="items-center justify-center">
                            <Boxicon name="bxs-file-blank" size={80} color="#d1d5db" />
                            <Text className="text-gray-400 mt-2 font-medium">
                                Enlace no disponible
                            </Text>
                        </View>
                    )}
                </View>

                <DialogFooter className="flex-row justify-center gap-2">
                    <DialogClose asChild>
                        <TouchableOpacity className="p-4 rounded-xl bg-gray-100 w-full items-center">
                            <Text className="text-gray-500 font-semibold">
                                Cerrar
                            </Text>
                        </TouchableOpacity>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentPreviewer;