import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";

const Index = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#61b346" />
            </View>
        );
    }

    return <Redirect href="/login" />;
};

export default Index;