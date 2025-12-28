import { Text } from "@/components/ui/text";
import { View } from "react-native";
import DocumentPreviewer from "@/components/DocumentPreviewer";
import StepContainer from "./StepContainer";

const DocumentStep = ({ data, onChange }: any) => {
    return (
        <StepContainer>
            <View className="bg-white gap-4 p-6 rounded-2xl">
                <Text variant="h3" className="text-primary font-bold">
                    Documentos
                </Text>

                <DocumentPreviewer
                    label="Identificación Oficial (INE)"
                    description="Verificar: Vigencia (año actual o posterior), firma visible, que la foto coincida con el solicitante y que se vean ambas caras."
                    needsReview={true}
                />

                <DocumentPreviewer
                    label="Comprobante de Domicilio (CFE/Agua)"
                    description="Verificar: Que la dirección coincida con la del formulario y que la fecha de emisión no tenga más de 3 meses de antigüedad."
                    needsReview={true}
                />

                <DocumentPreviewer
                    label="Acta de Nacimiento"
                    description="Verificar: Sello oficial visible, que el nombre esté escrito correctamente sin abreviaturas y coincida con el CURP."
                    needsReview={true}
                />

                <DocumentPreviewer
                    label="Título de Propiedad / Carta de Posesión"
                    description="Verificar: Nombre del propietario (debe ser el solicitante o cónyuge), medidas del terreno legibles y sellos de la autoridad ejidal o notario."
                    needsReview={true}
                />

                <DocumentPreviewer
                    label="Comprobante de Ingresos"
                    description="Verificar: Monto de sueldo neto, fecha reciente, firma del patrón y sello de la empresa (si aplica). Debe coincidir con lo declarado."
                    needsReview={true}
                />
            </View>
        </StepContainer>
    );
};

export default DocumentStep;
