import { View } from "react-native";
import { BoxIconName } from "@/components/Boxicons";
import { Text } from "@/components/ui/text";

const InfoRow = ({
    label,
    value,
    description,
    className,
}: {
    label: string;
    value?: string | null | boolean;
    icon?: BoxIconName;
    description?: string;
    className?: string;
}) => {
    return (
        <View className="flex-row gap-3 items-start">
            <View className="gap-0.5">
                <Text className="text-gray-400 text-sm uppercase">{label}</Text>
                <View>
                    <Text className={`text-gray-600 font-bold ${className}`}>{value}</Text>
                    {description && (
                        <Text className="text-gray-400 text-sm">
                            {description}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};

export default InfoRow;
