import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import DocumentPreviewer from "@/components/DocumentPreviewer";
import { Badge } from "@/components/ui/badge";
import { formatDate, getPlusCode } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalSearchParams, useRouter } from "expo-router";
import DetailSectionCard from "@/components/DetailSectionCard";
import InfoRow from "@/components/InfoRow";
import ServicesList from "@/components/ServicesList";
import { Document, FamilyProfile, Member } from "@/types/api";
import { familyService } from "@/services/familyService";

const Page = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [data, setData] = useState<FamilyProfile>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const loadFamily = async () => {
            try {
                const family = await familyService.getById(Number(id));

                setData(family);
            } catch (error) {
                console.error(error);
                Alert.alert(
                    "Error",
                    "No se pudo cargar el perfil, se mostrarán datos de prueba."
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadFamily();
    }, [id]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#61b346" />
                <Text className="mt-4 text-gray-500">Cargando perfil...</Text>
            </View>
        );
    }

    if (!data) return null;

    const children =
        data.members?.filter((m: Member) =>
            m.relationship?.toLowerCase().includes("hijo")
        ) || [];

    const parents =
        data.members?.filter(
            (m: Member) =>
                m.relationship?.toLowerCase().includes("padre") ||
                m.relationship?.toLowerCase().includes("tutor") ||
                m.relationship?.toLowerCase().includes("madre")
        ) || [];

    const getAge = (dateString: string) => {
        if (!dateString) return "?";
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerClassName="p-4 pb-20 gap-4"
            showsVerticalScrollIndicator={false}
        >
            <View className="bg-white rounded-2xl">
                <View className="h-80 bg-gray-200 items-center justify-center">
                    <Boxicon name="bxs-image" size={48} color="#9ca3af" />
                    <Text className="w-full text-center text-gray-400 mt-2">
                        Fotografía Familiar
                    </Text>
                </View>
                <View className="p-6 bg-white rounded-2xl rounded-t-none gap-6">
                    <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                            <Text
                                variant="h2"
                                className="flex-1 text-primary font-bold py-0 border-b-transparent"
                            >
                                {data.family_name}
                            </Text>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <TouchableOpacity className="p-1">
                                        <Boxicon
                                            name="bxs-dots-vertical-rounded"
                                            size={28}
                                            color="#9ca3af"
                                        />
                                    </TouchableOpacity>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-white rounded-2xl border-transparent shadow-lg shadow-black/40"
                                >
                                    <DropdownMenuItem className="flex-row gap-1 items-center p-3 rounded-lg">
                                        <Text className="text-gray-600">
                                            <Boxicon
                                                name="bxs-share"
                                                size={20}
                                            />
                                        </Text>
                                        <Text className="text-gray-600 text-base">
                                            Compartir
                                        </Text>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onPress={() =>
                                            router.push(
                                                "/new-family-profile/123"
                                            )
                                        }
                                        className="flex-row gap-1 items-center p-3 rounded-lg"
                                    >
                                        <Text className="text-gray-600">
                                            <Boxicon
                                                name="bxs-edit"
                                                size={20}
                                            />
                                        </Text>
                                        <Text className="text-gray-600 text-base">
                                            Editar
                                        </Text>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </View>
                        <View className="gap-2">
                            <View className="flex-1 flex-row items-center gap-1">
                                <Text className="text-gray-400">
                                    <Boxicon name="bxs-location" size={16} />
                                </Text>
                                <Text className="text-gray-400 text-sm">
                                    {data.construction_address ?? ""}
                                </Text>
                            </View>
                            <View className="flex-1 flex-row items-center gap-1">
                                <Text className="text-gray-400">
                                    <Boxicon name="bxs-clock" size={16} />
                                </Text>
                                <Text className="text-gray-400 text-sm">
                                    {formatDate(data.opened_at) ?? ""}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {/* <View className="flex-row gap-2 items-center">
                        <TouchableOpacity
                            onPress={() =>
                                Linking.openURL(
                                    `whatsapp://send?phone=${data.phoneNumber}`
                                )
                            }
                            className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center"
                        >
                            <Boxicon
                                name="bxs-phone"
                                size={16}
                                color="#ffffff"
                            />
                            <Text className="text-white font-bold">
                                Contactar (Principal)
                            </Text>
                        </TouchableOpacity>

                        {data.phoneNumberExtra && (
                            <TouchableOpacity
                                onPress={() =>
                                    Linking.openURL(
                                        `whatsapp://send?phone=${data.phoneNumberExtra}`
                                    )
                                }
                                className="bg-gray-100 px-5 py-5 gap-1 rounded-2xl flex-row justify-center items-center"
                            >
                                <Boxicon
                                    name="bxs-phone"
                                    size={16}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        )}
                    </View> */}
                </View>
            </View>

            <DetailSectionCard title="Padres y Tutores" icon="bxs-man-woman">
                <View className="gap-3">
                    {parents.length > 0 ? (
                        parents.map((parent: Member) => (
                            <View key={parent.id} className="gap-2">
                                <Text>{`${parent.name} ${parent.paternal_surname}`}</Text>
                                <View className="flex-row gap-1">
                                    <View className="flex-1">
                                        <InfoRow
                                            value={`${getAge(
                                                parent.birth_date
                                            )} años`}
                                            label="Edad"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <InfoRow
                                            value={`${parent.curp}`.toUpperCase()}
                                            label="Curp"
                                        />
                                    </View>
                                </View>
                                <View className="flex-row gap-1">
                                    <View className="flex-1">
                                        <InfoRow
                                            label="Trabajo"
                                            value={parent.occupation || "No"}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <InfoRow
                                            className="capitalize"
                                            label="Relación"
                                            value={`${parent.relationship}`}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic py-2">
                            No hay padres registrados en este perfil
                        </Text>
                    )}
                </View>
                {/* <View className="flex-row gap-1">
                    <View className="flex-1">
                        <InfoRow
                            label="Estado Civil"
                            value={data.civilState}
                            description={data.timeCivilState}
                        />
                    </View>
                    <View className="flex-1">
                        <InfoRow
                            label="Religión"
                            value={`${data.religion}, ${data.timeReligion}`}
                            description={data.churchAttendance}
                        />
                    </View>
                </View>

                <View className="h-[1px] bg-gray-200/70 my-1" />

                <View className="flex-row gap-1">
                    <View className="flex-1">
                        {data.speaksDialect && (
                            <InfoRow
                                label="Lengua Indígena"
                                value={data.nativeDialect}
                            />
                        )}
                    </View>
                    <View className="flex-1">
                        <InfoRow
                            label="Visa EEUU"
                            value={data.hasVisa ? "Tiene Visa" : "No tiene"}
                        />
                    </View>
                </View>

                <View className="flex-row gap-1">
                    <View className="flex-1">
                        <InfoRow
                            label="Familia en EEUU"
                            value={data.familyInUsa ? "Si" : "No"}
                        />
                    </View>
                </View>

                <View>
                    <Text className="text-sm text-gray-400 uppercase">
                        Apoyos
                    </Text>
                    {data.receivesUsaSupport === false &&
                        data.hasGovSupport === false && (
                            <Text className="text-gray-600 font-bold">
                                No recibe apoyo
                            </Text>
                        )}

                    <View className="gap-3">
                        {data.receivesUsaSupport && (
                            <View className="bg-[#9BD189]/10 mt-2 py-3 px-4 flex-row gap-2 justify-between items-center rounded-xl border border-green-100">
                                <View>
                                    <Text className="font-bold uppercase text-primary text-sm">
                                        Apoyo de USA
                                    </Text>
                                    <Text className="text-green-800">
                                        {data.familyInUsaSupport}
                                    </Text>
                                </View>
                                <Boxicon
                                    name="bxs-dollar"
                                    size={24}
                                    color="#61b346"
                                />
                            </View>
                        )}
                        {data.hasGovSupport && (
                            <View className="bg-[#9BD189]/10 py-3 px-4 flex-row gap-2 justify-between items-center rounded-xl border border-green-100">
                                <View>
                                    <Text className="font-bold uppercase text-primary text-sm">
                                        Apoyo del Gobierno
                                    </Text>
                                    <Text className="text-green-800">
                                        {data.govSupport}
                                    </Text>
                                </View>
                                <Boxicon
                                    name="bxs-dollar"
                                    size={24}
                                    color="#61b346"
                                />
                            </View>
                        )}
                    </View>
                </View>

                <View className="h-[1px] bg-gray-200/70 my-1" />

                <InfoRow
                    label="Adicciones"
                    value={
                        data.hasAddiction ? data.addictionProblems : "Ninguna"
                    }
                />
                <InfoRow label="Referencia" value={data.referralSource} /> */}
            </DetailSectionCard>

            <DetailSectionCard title="Hijos" icon="bxs-child">
                <View className="gap-3">
                    {children.length > 0 ? (
                        children.map((child: Member) => (
                            <View key={child.id} className="gap-2">
                                <Text>{`${child.name} ${child.paternal_surname}`}</Text>
                                <View className="flex-row gap-1">
                                    <View className="flex-1">
                                        <InfoRow
                                            value={`${getAge(
                                                child.birth_date
                                            )} años`}
                                            label="Edad"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <InfoRow
                                            value={`${child.curp}`.toUpperCase()}
                                            label="Curp"
                                        />
                                    </View>
                                </View>
                                <InfoRow
                                    label="Trabajo Infantil"
                                    value={child.occupation || "No"}
                                />
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic py-2">
                            No hay hijos registrados en este perfil
                        </Text>
                    )}
                </View>
            </DetailSectionCard>

            <DetailSectionCard title="Terreno" icon="bxs-location">
                <View className="flex-row gap-1">
                    <View className="flex-1">
                        <InfoRow
                            label="Ubicación del Terreno"
                            value={data.construction_address}
                        />
                    </View>
                    {/* <View className="flex-1">
                        <InfoRow
                            label="GPS"
                            value={getPlusCode(data.landGps)}
                            description={data.landGps}
                        />
                    </View> */}
                </View>

                {/* <View className="flex-row gap-1">
                    <View className="flex-1">
                        <InfoRow
                            label="Nombre del Dueño"
                            value={data.landOwner}
                        />
                    </View>
                    <View className="flex-1 gap-0.5">
                        <Text className="text-gray-400 text-sm uppercase">
                            Donde Vive
                        </Text>
                        <View className="flex-row items-center gap-1">
                            {data.livesInLand === true ? (
                                <>
                                    <Text className="text-primary">
                                        <Boxicon
                                            name="bxs-check-circle"
                                            size={18}
                                        />
                                    </Text>
                                    <Text>Vive en el Terreno</Text>
                                </>
                            ) : (
                                <>
                                    <Text className="text-red-500">
                                        <Boxicon
                                            name="bxs-x-circle"
                                            size={18}
                                        />
                                    </Text>
                                    <Text>No Vive en el Terreno</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                <View className="h-[1px] bg-gray-100 my-2" />

                <View>
                    <Text className="text-gray-400 text-sm uppercase mb-2">
                        Servicios
                    </Text>
                    <ServicesList services={data.landServices || []} />
                </View>

                <InfoRow
                    label="Requiere Mufa"
                    value={data.landNeedsMufa ? "Si" : "No"}
                />

                <View className="h-[1px] bg-gray-100 my-2" />

                <View className="flex-row gap-1">
                    <View className="flex-1">
                        <InfoRow
                            label="Costo Total"
                            value={`$${data.landPrice}`}
                            description={data.landPriceCurrency.toUpperCase()}
                        />
                    </View>
                    <View className="flex-1">
                        <InfoRow
                            label="Mensualidad"
                            value={`$${data.landMonthlyPayment}`}
                            description={data.landMonthlyPaymentCurrency.toUpperCase()}
                        />
                    </View>
                </View>

                <View className="flex-row gap-1">
                    <View className="flex-1">
                        <InfoRow
                            label="Último Pago"
                            value={data.landLastPayment}
                        />
                    </View>
                    <View className="flex-1 gap-0.5">
                        <Text className="text-gray-400 text-sm uppercase">
                            Estado de Pagos
                        </Text>
                        <View className="flex-row items-center gap-1">
                            {data.landPaymentsUptodate === true ? (
                                <>
                                    <Text className="text-primary">
                                        <Boxicon
                                            name="bxs-check-circle"
                                            size={18}
                                        />
                                    </Text>
                                    <Text>Pagos al corriente</Text>
                                </>
                            ) : (
                                <>
                                    <Text className="text-red-500">
                                        <Boxicon
                                            name="bxs-x-circle"
                                            size={18}
                                        />
                                    </Text>
                                    <Text>No va al corriente</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                <InfoRow
                    label="Enganche"
                    value={`$${data.landDownPayment}`}
                    description={data.landDownPaymentCurrency.toUpperCase()}
                />
                <InfoRow
                    label="Medidas"
                    value={`${data.landMeasurements} (${data.landArea})`}
                />

                <TouchableOpacity className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center">
                    <Boxicon name="bxs-location" size={16} color="#ffffff" />
                    <Text className="text-white font-bold">Ver Mapa</Text>
                </TouchableOpacity> */}
            </DetailSectionCard>

            {data.current_address ? (
                <DetailSectionCard title="Vivienda Actual" icon="bxs-home-alt">
                    <View className="flex-row gap-1">
                        <View className="flex-1">
                            <InfoRow
                                label="Ubicación"
                                value={data.current_address}
                            />
                        </View>
                        {/* <View className="flex-1">
                            <InfoRow
                                label="GPS"
                                value={getPlusCode(data.currentGps)}
                                description={data.currentGps}
                            />
                        </View> */}
                    </View>

                    {/* <View className="h-[1px] bg-gray-200/70 my-1" />

                    <View className="flex-row gap-1">
                        <View className="flex-1">
                            <InfoRow label="Dueño" value={data.landlordName} />
                        </View>
                        <View className="flex-1">
                            <InfoRow label="Tipo" value={data.housingType} />
                        </View>
                    </View>

                    <View className="h-[1px] bg-gray-200/70 my-1" />

                    <View className="flex-row gap-1">
                        <View className="flex-1">
                            <InfoRow
                                label="Costo Renta"
                                value={
                                    data.rentCost ? `$${data.rentCost}` : "N/A"
                                }
                                description={data.rentCostCurrency.toUpperCase()}
                            />
                        </View>
                        <View className="flex-1 gap-0.5">
                            <Text className="text-gray-400 text-sm uppercase">
                                Recibos
                            </Text>
                            <View className="flex-row items-center gap-1">
                                {data.hasRentReceipts === true ? (
                                    <>
                                        <Text className="text-primary">
                                            <Boxicon
                                                name="bxs-check-circle"
                                                size={18}
                                            />
                                        </Text>
                                        <Text>Cuenta con Recibos</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-red-500">
                                            <Boxicon
                                                name="bxs-x-circle"
                                                size={18}
                                            />
                                        </Text>
                                        <Text>No Cuenta con Recibos</Text>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>

                    <InfoRow
                        label="Tiempo Viviendo"
                        value={data.timeInCurrentHousing}
                    />

                    <TouchableOpacity className="flex-1 bg-primary px-4 py-4 gap-1 rounded-2xl flex-row justify-center items-center">
                        <Boxicon
                            name="bxs-location"
                            size={16}
                            color="#ffffff"
                        />
                        <Text className="text-white font-bold">Ver Mapa</Text>
                    </TouchableOpacity> */}
                </DetailSectionCard>
            ) : (
                <DetailSectionCard title="Vivienda Actual" icon="bxs-home">
                    <Text className="text-gray-500 italic">
                        Viven actualmente en el terreno
                    </Text>
                </DetailSectionCard>
            )}

            <DetailSectionCard title="Estado de la Casa" icon="bxs-home-heart">
                <Text></Text>
                {/* <InfoRow label="Techo" value={data.roofMaterial} />
                <InfoRow label="Piso" value={data.floorMaterial} />
                <InfoRow label="Paredes" value={data.wallMaterial} />
                <View className="h-[1px] bg-gray-200/70 my-1" />
                <InfoRow label="Cuartos" value={data.numBedrooms} />
                <InfoRow label="Condición" value={data.roomCondition} />
                <InfoRow label="Baño" value={data.bathroomDetails} />
                <InfoRow label="Muebles" value={data.furnitureDetails} /> */}
            </DetailSectionCard>

            <DetailSectionCard title="Documentos" icon="bxs-file-detail">
                <View className="gap-4">
                    {data.documents && data.documents.length > 0 ? (
                        data.documents.map((document: Document) => (
                            <View key={document.id} className="gap-2">
                                <DocumentPreviewer
                                    label={document.document_type}
                                />
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 italic py-2">
                            No hay documentos registrados en este perfil
                        </Text>
                    )}
                </View>
            </DetailSectionCard>
        </ScrollView>
    );
};

export default Page;
