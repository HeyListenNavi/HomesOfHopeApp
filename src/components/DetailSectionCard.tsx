import { View } from "react-native";
import Boxicon, { BoxIconName } from "@/components/Boxicons";
import { Text } from "@/components/ui/text";

const DetailSectionCard = ({
    title,
    children,
    icon,
}: {
    title: string;
    children: React.ReactNode;
    icon?: BoxIconName;
}) => (
    <View className="bg-white p-6 rounded-2xl gap-4">
        <View className="flex-row items-center gap-2">
            {icon && <Boxicon name={icon} size={20} color="#61b346" />}
            <Text className="text-gray-800 font-bold text-lg">{title}</Text>
        </View>
        <View className="gap-3">{children}</View>
    </View>
);

export default DetailSectionCard;
