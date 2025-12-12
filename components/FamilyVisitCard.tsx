import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import Boxicon from "~/components/Boxicons";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

export interface FamilyVisit {
    id: number;
    name: string;
    location: string;
    status: "pending" | "visited";
    phone?: string;
    coords?: { lat: number; lng: number };
}

interface VisitFamilyCardProps {
    family: FamilyVisit;
    index: number;
}

export const VisitFamilyCard = ({ family, index }: VisitFamilyCardProps) => {
    const isVisited = family.status === "visited";

    return (
        <TouchableOpacity
            className="p-4 rounded-2xl gap-3 bg-white"
        >
            <View className="flex-row items-center gap-3">
                <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                    isVisited ? "bg-primary" : "bg-gray-200"
                }`}
            >
                <Text
                    className={`font-bold ${
                        isVisited ? "text-white" : "text-gray-500"
                    }`}
                >
                    {index}
                </Text>
            </View>

            <View className="flex-1">
                <Text
                    className={`font-bold text-lg ${
                        isVisited ? "text-primary" : "text-gray-800"
                    }`}
                >
                    {family.name}
                </Text>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    {family.location}
                </Text>
            </View>

            <Dialog>
                <DialogTrigger asChild>
                    <TouchableOpacity
                        className={`p-2 rounded-full ${
                            isVisited ? "bg-primary" : "bg-gray-200"
                        }`}
                    >
                        <Boxicon
                            name="bx-check"
                            size={20}
                            color={isVisited ? "white" : "#9ca3af"}
                        />
                    </TouchableOpacity>
                </DialogTrigger>
                <DialogContent className="max-w-sm bg-white rounded-3xl px-6 py-8">
                    <DialogHeader className="items-center gap-3">
                        <View className="h-12 w-12 rounded-full bg-primary items-center justify-center">
                            <Boxicon
                                name="bx-check"
                                size={28}
                                color="#ffffff"
                            />
                        </View>

                        <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                            Confirmar visita
                        </DialogTitle>

                        <DialogDescription className="text-gray-500 text-center text-base">
                            ¿Deseas marcar a esta familia como visitada? Esto
                            actualizará el progreso de tu ruta.
                        </DialogDescription>
                    </DialogHeader>

                    <View className="py-4 gap-2">
                        <Text className="text-xs font-bold text-gray-400 tracking-wider ml-1">
                            Notas de la visita (Opcional)
                        </Text>
                        <Textarea
                            placeholder="Notas"
                            className="h-24 bg-gray-50 rounded-xl p-3 text-gray-800 leading-5"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <DialogFooter className="flex-col gap-3 sm:flex-row">
                        <DialogClose asChild>
                            <TouchableOpacity className="bg-primary p-4 rounded-xl items-center justify-center">
                                <Text className="text-white font-bold">
                                    Marcar como Visitada
                                </Text>
                            </TouchableOpacity>
                        </DialogClose>

                        <DialogClose asChild>
                            <TouchableOpacity className="p-4 rounded-xl items-center justify-center bg-transparent">
                                <Text className="text-gray-500 font-semibold">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </View>

            <View className="flex-row justify-between gap-4">
                <TouchableOpacity className="flex-row flex-1 gap-1 px-2 py-3 bg-orange-50 rounded-xl">
                    <Boxicon name="bxs-phone" size={20} color="#f97316" />
                    <Text className="text-[#f97316] font-bold">Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row flex-1 gap-1 px-2 py-3 bg-blue-50 rounded-xl">
                    <Boxicon name="bxs-map" size={20} color="#3b82f6" />
                    <Text className="text-[#3b82f6] font-bold">Ver mapa</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};
