import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import EmptyState from '@/components/EmptyState';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View className="flex-1 bg-gray-100 items-center justify-center p-6">
                <View className="w-full gap-2">
                    <EmptyState
                        emoji="🧭"
                        title="Esta pantalla no existe"
                        subtitle="El enlace que seguiste no lleva a ningún lugar."
                    />
                    <Link href="/" asChild>
                        <Text className="text-center text-primary font-bold text-lg py-4">
                            Ir al inicio
                        </Text>
                    </Link>
                </View>
            </View>
        </>
    );
}
