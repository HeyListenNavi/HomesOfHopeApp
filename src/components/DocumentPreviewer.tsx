import { TouchableOpacity, View } from "react-native";
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

interface DocumentPreviewerProps {
    label?: string;
    description?: string;
    iconName?: string;
}

const DocumentPreviewer = ({
    label = "Documento",
    description = "Descripción del documento",
}: DocumentPreviewerProps) => {
    return (
        <Dialog>
            <View className="gap-2">
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
                    <TouchableOpacity className="relative bg-white items-center justify-center h-96 p-4 rounded-2xl border-2 border-gray-300 border-dashed">
                        <Boxicon
                            name="bxs-arrow-out-up-square-half"
                            size={48}
                            color="#61b346"
                        />
                        <Text className="text-primary text-center text-2xl font-bold mt-2">
                            {label}
                        </Text>

                        <View className="absolute flex-row gap-4 bottom-3 bg-white p-2 rounded-2xl">
                            <TouchableOpacity>
                                <Boxicon
                                    name="bxs-x-circle"
                                    size={48}
                                    color="#ef4444"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Boxicon
                                    name="bxs-check-circle"
                                    size={48}
                                    color="#61b346"
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </DialogTrigger>
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

                <View className="w-full h-96 bg-gray-100 rounded-xl border border-gray-200 items-center justify-center my-4">
                    <Boxicon name="bxs-file" size={80} color="#d1d5db" />
                    <Text className="text-gray-400 mt-2 font-medium">
                        Vista Previa del Documento
                    </Text>
                </View>

                <DialogFooter className="flex-row justify-center gap-2">
                    <DialogClose asChild>
                        <Button
                            className="bg-gray-100 rounded-xl px-6"
                            variant="secondary"
                        >
                            <Text className="text-gray-600 font-bold">
                                Cerrar
                            </Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentPreviewer;
