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
    copyable = false,
}: {
    label: string;
    value?: string | null | boolean;
    icon?: BoxIconName;
    iconColor?: string;
    description?: string;
    className?: string;
    copyable?: boolean;
}) => {
    return (
        <View className="flex-row gap-1 items-start">
            {icon && <Boxicon name={icon} color={iconColor} size={20} />}
            <View className="gap-0.5">
                <Text className="text-gray-400 text-base font-medium">{label}</Text>
                <View>
                    <Text 
                        className={`text-gray-700 text-base font-bold ${className}`}
                        selectable={copyable}
                    >
                        {value}
                    </Text>
                    {description && (
                        <Text className="text-gray-400 text-base">
                            {description}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};

export default InfoRow;
