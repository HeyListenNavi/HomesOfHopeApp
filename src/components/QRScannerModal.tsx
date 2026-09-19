import React from "react";
import { View, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { CameraView, useCameraPermissions } from "expo-camera";
import Boxicon from "@/components/Boxicons";

interface QRScannerModalProps {
    visible: boolean;
    onScanned: (value: string) => void;
    onClose: () => void;
}

const QRScannerModal = ({ visible, onScanned, onClose }: QRScannerModalProps) => {
    const [permission, requestPermission] = useCameraPermissions();
    const scanned = React.useRef(false);

    
    React.useEffect(() => {
        if (visible) scanned.current = false;
    }, [visible]);

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (scanned.current) return;
        scanned.current = true;
        onScanned(data);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={StyleSheet.absoluteFill} className="bg-black">
                {}
                {!permission?.granted ? (
                    <View className="flex-1 items-center justify-center gap-6 px-8">
                        <Boxicon name="bxs-camera" size={56} color="#9ca3af" />
                        <Text className="text-white text-xl font-bold text-center">
                            Se necesita acceso a la cámara
                        </Text>
                        <Text className="text-gray-400 text-base text-center leading-relaxed">
                            Para escanear códigos QR de asistencia necesitamos permiso para usar tu cámara.
                        </Text>
                        <TouchableOpacity
                            onPress={requestPermission}
                            className="bg-primary px-8 py-4 rounded-2xl active:opacity-80"
                        >
                            <Text className="text-white font-bold text-base">Permitir acceso</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} className="py-2">
                            <Text className="text-gray-400 font-medium text-sm">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <CameraView
                            style={StyleSheet.absoluteFill}
                            facing="back"
                            onBarcodeScanned={handleBarcodeScanned}
                            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                        />

                        <View
                            pointerEvents="none"
                            style={[
                                StyleSheet.absoluteFill,
                                { justifyContent: "center", alignItems: "center" },
                            ]}
                        >
                            {}
                            <View
                                style={{ width: 240, height: 240 }}
                                className="border-4 border-primary rounded-3xl"
                            ></View>
                        </View>

                        {}
                        <View
                            className="absolute top-0 left-0 right-0 bg-black/50 px-6 pt-14 pb-5 flex-row items-center gap-4"
                        >
                            <TouchableOpacity
                                onPress={onClose}
                                className="bg-white/10 p-2.5 rounded-full active:bg-white/20"
                            >
                                <Boxicon name="bx-x" size={24} color="#ffffff" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-white font-bold text-lg">Tomar Lista</Text>
                                <Text className="text-gray-300 text-sm">Apunta al código QR del aplicante</Text>
                            </View>
                        </View>

                        {}
                        <View className="absolute bottom-16 left-0 right-0 items-center">
                            <View className="bg-black/50 px-5 py-2.5 rounded-full">
                                <Text className="text-gray-300 text-sm font-medium">
                                    El escaneo es automático
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
};

export default QRScannerModal;
