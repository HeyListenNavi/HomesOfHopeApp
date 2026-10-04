import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

const Index = () => {
    const token = useAuthStore((state) => state.token);

    return <Redirect href={token ? "/(tabs)" : "/login"} />;
};

export default Index;
