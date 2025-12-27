import { BoxIconName } from "@/components/Boxicons";
import React from "react";
import FamilyStep from "./steps/FamilyStep";
import ParentStep from "./steps/ParentStep";
import ChildrenStep from "./steps/ChildrenStep";
import OtherMemberStep from "./steps/OtherMemberStep";
import LandStep from "./steps/LandStep";
import CurrentHouseStep from "./steps/CurentHouseStep";
import HouseStateStep from "./steps/HouseStateStep";
import DocumentStep from "./steps/DocumentStep";

export const RESET_MAP: Record<string, string[]> = {
    speaksDialect: ["nativeDialect"],
    hasGovSupport: ["govSupport"],
    hasVisa: [],
    familyInUsa: ["receivesUsaSupport", "familyInUsaSupport"],
    receivesUsaSupport: ["familyInUsaSupport"],
    hasAddiction: ["addictionProblems"],
    livesInLand: [
        "timeLivingLand",
        "currentCity",
        "currentNeighborhood",
        "currentGps",
        "housingType",
        "landlordName",
        "timeInCurrentHousing",
        "rentCost",
        "hasRentReceipts",
    ],
};

interface Step {
    title: string;
    icon: BoxIconName;
    component: React.ComponentType<any>;
}

export const STEPS: Step[] = [
    { title: "Familia", icon: "bxs-parent-child", component: FamilyStep },
    { title: "Padres", icon: "bxs-man-woman", component: ParentStep },
    { title: "Hijos", icon: "bxs-child", component: ChildrenStep },
    { title: "Otros", icon: "bxs-user-plus", component: OtherMemberStep },
    { title: "Terreno", icon: "bxs-file-detail", component: LandStep },
    { title: "Vivienda", icon: "bxs-home", component: CurrentHouseStep },
    { title: "Estado", icon: "bxs-building-house", component: HouseStateStep },
    { title: "Documentos", icon: "bxs-file", component: DocumentStep },
];
