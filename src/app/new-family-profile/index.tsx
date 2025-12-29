import Boxicon from "@/components/Boxicons";
import React, { useRef, useState, useEffect } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { usePagerView } from "react-native-pager-view";
import { RESET_MAP, STEPS } from "./constants";
import { Text } from "@/components/ui/text";
import { ParentState } from "./steps/AddParentStep";

export interface ProfileState {
    // --- Family ---
    familyName: string | null;
    phoneNumber: string | null;
    phoneNumberExtra: string | null;
    date: Date | string | null;

    // --- Parents ---
    parents: ParentState[];
    civilState: string | null;
    timeCivilState: string | null;
    religion: string | null;
    timeReligion: string | null;
    churchAttendance: string | null;
    speaksDialect: boolean;
    nativeDialect: string | null;
    hasGovSupport: boolean;
    govSupport: string | null;
    hasVisa: boolean;
    familyInUsa: boolean;
    receivesUsaSupport: boolean;
    familyInUsaSupport: string | null;
    hasAddiction: boolean;
    addictionProblems: string | null;
    referralSource: string | null;

    // --- Children ---
    children: any[];
    hasSpecialNeeds: boolean | null;
    childrenWorking: boolean | null;

    // --- Others ---
    others: any[];

    // --- Land ---
    landCity: string | null;
    landNeighborhood: string | null;
    livesInLand: boolean;
    timeLivingLand: string | null;
    landPrice: string | number | null;
    landPriceCurrency: string | null;
    landServices: string | null;
    landGps: string | null;
    landOwner: string | null;
    landDownPayment: string | number | null;
    landDownPaymentCurrency: string | null;
    landMonthlyPayment: string | number | null;
    landMonthlyPaymentCurrency: string | null;
    landLastPayment: string | null;
    landPaymentsUptodate: boolean | null;
    landNeedsMufa: boolean | null;
    landMeasurements: string | null;
    landArea: string | number | null;

    // --- Current House ---
    currentCity: string | null;
    currentNeighborhood: string | null;
    currentGps: string | null;
    housingType: string | null;
    landlordName: string | null;
    timeInCurrentHousing: string | null;
    rentCost: string | number | null;
    rentCostCurrency: string | null;
    hasRentReceipts: boolean;

    // --- House state ---
    roofMaterial: string | null;
    floorMaterial: string | null;
    wallMaterial: string | null;
    numBedrooms: number | string | null;
    roomCondition: string | null;
    bathroomDetails: string | null;
    furnitureDetails: string | null;
}

const initialProfileState: ProfileState = {
    // --- Family ---
    familyName: null,
    phoneNumber: null,
    phoneNumberExtra: null,
    date: null,

    // --- Parents ---
    parents: [],
    civilState: null,
    timeCivilState: null,
    religion: null,
    timeReligion: null,
    churchAttendance: null,
    speaksDialect: false,
    nativeDialect: null,
    hasGovSupport: false,
    govSupport: null,
    hasVisa: false,
    familyInUsa: false,
    receivesUsaSupport: false,
    familyInUsaSupport: null,
    hasAddiction: false,
    addictionProblems: null,
    referralSource: null,

    // --- Children ---
    children: [],
    hasSpecialNeeds: null,
    childrenWorking: null,

    // --- Others ---
    others: [],

    // --- Land ---
    landCity: null,
    landNeighborhood: null,
    livesInLand: false,
    timeLivingLand: null,
    landPrice: null,
    landPriceCurrency: null,
    landServices: null,
    landGps: null,
    landOwner: null,
    landDownPayment: null,
    landDownPaymentCurrency: null,
    landMonthlyPayment: null,
    landMonthlyPaymentCurrency: null,
    landLastPayment: null,
    landPaymentsUptodate: null,
    landNeedsMufa: null,
    landMeasurements: null,
    landArea: null,

    // --- Current House ---
    currentCity: null,
    currentNeighborhood: null,
    currentGps: null,
    housingType: null,
    landlordName: null,
    timeInCurrentHousing: null,
    rentCost: null,
    rentCostCurrency: null,
    hasRentReceipts: false,

    // --- House state ---
    roofMaterial: null,
    floorMaterial: null,
    wallMaterial: null,
    numBedrooms: null,
    roomCondition: null,
    bathroomDetails: null,
    furnitureDetails: null,
};

const Page = () => {
    const { AnimatedPagerView, ref, activePage, setPage, onPageSelected } =
        usePagerView();
    const scrollViewRef = useRef<ScrollView>(null);

    const [formData, setFormData] = useState<ProfileState>(initialProfileState);

    const handleChange = <K extends keyof ProfileState>(
        key: K,
        value: ProfileState[K]
    ) => {
        setFormData((prev) => {
            const updates: Partial<ProfileState> = { [key]: value };

            if (RESET_MAP[key]) {
                RESET_MAP[key].forEach(
                    (f) => (updates[f as keyof ProfileState] = undefined)
                );
            }

            if (key === "civilState" && value === "soltero") {
                updates.timeCivilState = null;
            }
            if (key === "religion" && value === "ninguna") {
                updates.timeReligion = null;
                updates.churchAttendance = null;
            }
            if (key === "housingType" && value !== "rentada") {
                updates.rentCost = null;
                updates.hasRentReceipts = false;
            }

            console.log(updates);
            return { ...prev, ...updates };
        });
    };

    useEffect(() => {
        scrollViewRef.current?.scrollTo({
            x: activePage * 80,
        });
    }, [activePage]);

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white pt-4 pb-2 px-2 shadow-sm z-10">
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2 px-2"
                >
                    {STEPS.map((step, index) => {
                        const isActive = activePage === index;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setPage(index)}
                                className={`px-4 py-2 rounded-full flex-row items-center gap-2 border ${
                                    isActive
                                        ? "bg-primary border-primary"
                                        : "bg-white border-gray-200"
                                }`}
                            >
                                <Boxicon
                                    name={step.icon as any}
                                    size={16}
                                    color={isActive ? "white" : "#6b7280"}
                                />
                                <Text
                                    className={`font-bold ${
                                        isActive
                                            ? "text-white"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {step.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <AnimatedPagerView
                ref={ref}
                style={{ flex: 1 }}
                initialPage={0}
                onPageSelected={onPageSelected}
            >
                {STEPS.map((step, index) => {
                    const StepComponent = step.component;

                    return (
                        <View key={index}>
                            <StepComponent
                                data={formData}
                                onChange={handleChange}
                            />
                        </View>
                    );
                })}
            </AnimatedPagerView>
        </View>
    );
};

export default Page;
