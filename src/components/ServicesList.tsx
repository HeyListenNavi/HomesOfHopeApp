import { View } from "react-native";
import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";

const ServicesList = ({ services }: { services: string[] }) => {
    if (!services || services.length === 0)
        return (
            <Text className="text-gray-400 italic">
                Sin servicios registrados
            </Text>
        );

    const serviceLabels: Record<string, string> = {
        bano: "Baño",
        luz: "Luz",
        agua: "Agua",
        drenaje: "Drenaje",
        fosa: "Fosa",
    };

    return (
        <View className="flex-row flex-wrap gap-2">
            {services.map((s) => (
                <View
                    key={s}
                    className="bg-[#9BD189]/10 px-3 py-1 rounded-full flex-row items-center gap-1"
                >
                    <Boxicon
                        name="bxs-check-circle"
                        size={12}
                        color="#61b346"
                    />
                    <Text className="text-gray-600 font-medium capitalize">
                        {serviceLabels[s] || s}
                    </Text>
                </View>
            ))}
        </View>
    );
};

export default ServicesList;