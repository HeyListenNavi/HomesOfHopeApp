import { View } from "react-native";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Text } from "@/components/ui/text";

const InfoRow = ({
    label,
    value,
    icon,
    iconColor = "#9ca3af",
    description,
    className,
}: {
    label: string;
    value?: string | null | boolean;
    icon?: BoxIconName;
    iconColor?: string;
    description?: string;
    className?: string;
}) => {
    return (
        <View className="flex-row gap-1 items-start">
            {icon && <Boxicon name={icon} color={iconColor} size={18} />}
            <View className="gap-1">
                <Text className="text-gray-400 text-sm uppercase">{label}</Text>
                <View>
                    <Text className={`text-gray-600 font-bold ${className}`}>
                        {value}
                    </Text>
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
