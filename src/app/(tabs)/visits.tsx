import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    ListRenderItem
} from "react-native";
import { Text } from "@/components/ui/text";
import { VisitCard } from "@/components/VisitCard";
import Boxicon from "@/components/Boxicons";
import { visitService } from "@/services/visitService";
import { Visit } from "@/types/api";

export default function VisitsScreen() {
    const [displayItems, setDisplayItems] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const pageRef = useRef(1);
    const lastPageRef = useRef(1);
    const loadingRef = useRef(false);

    const fetchItems = async (refresh = false) => {
        if (loadingRef.current) return;
        
        loadingRef.current = true;
        if (refresh) setIsLoading(true);

        try {
            const pageToFetch = refresh ? 1 : pageRef.current;
            const response = await visitService.getAll(pageToFetch);

            if (refresh) {
                setDisplayItems(response.data);
                pageRef.current = 2;
            } else {
                setDisplayItems((prev) => {
                    const existingIds = new Set(prev.map((v) => v.id));
                    const newItems = response.data.filter((v) => !existingIds.has(v.id));
                    return [...prev, ...newItems];
                });
                pageRef.current += 1;
            }

            lastPageRef.current = response.last_page;
        } catch (error) {
            console.error("Error fetching visits:", error);
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchItems(true);
    }, []);

    const onEndReached = () => {
        if (!loadingRef.current && pageRef.current <= lastPageRef.current) {
            fetchItems();
        }
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchItems(true);
    };

    // const today = new Date().toDateString(); 
    const today = new Date(new Date().getFullYear(), 1, 12).toDateString();

    const todaysVisits = useMemo(() => 
        displayItems.filter(v => new Date(v.scheduled_at).toDateString() === today),
    [displayItems]);

    const futureVisits = useMemo(() => 
        displayItems.filter(v => new Date(v.scheduled_at).toDateString() !== today),
    [displayItems]);


    const renderItem: ListRenderItem<Visit> = ({ item }) => {
        return (
            <View className="mb-3">
                <VisitCard 
                    visit={item} 
                    variant="summary"
                />
            </View>
        );
    };

    const ListHeaderComponent = () => (
        <View className="mb-4 mt-2">
            <View className="mb-6">
                <Text className="text-gray-500 text-sm">
                    Gestión y seguimiento
                </Text>
                <Text variant="h3" className="font-bold text-gray-800">
                    Visitas
                </Text>
            </View>

            {/* SECCIÓN: VISITAS DE HOY */}
            {todaysVisits.length > 0 ? (
                <View className="gap-3 mb-6">
                    {todaysVisits.map((visit) => (
                        <VisitCard 
                            key={visit.id} 
                            visit={visit} 
                            variant="full" 
                        />
                    ))}
                </View>
            ) : (
                <View className="bg-white px-6 py-12 rounded-2xl items-center gap-2 mb-6">
                    <Boxicon name="bxs-calendar-x" size={32} color="#9ca3af" />
                    <Text className="text-gray-500">
                        No hay visitas para hoy
                    </Text>
                </View>
            )}

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500">
                    Próximas Visitas
                </Text>
            </View>
        </View>
    );

    const ListFooterComponent = () => {
        if (loadingRef.current && displayItems.length > 0) {
            return (
                <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#61b346" />
                    <Text className="text-xs text-gray-400 mt-2">Cargando más...</Text>
                </View>
            );
        }
        return <View className="h-10" />;
    };

    const ListEmptyComponent = () => {
        if (!isLoading && futureVisits.length === 0) {
            return (
                <View className="bg-white px-6 py-8 rounded-2xl items-center gap-2">
                    <Boxicon name="bxs-calendar" size={32} color="#9ca3af" />
                    <Text className="text-gray-500">
                        No hay visitas futuras programadas.
                    </Text>
                </View>
            );
        }
        return null;
    };

    return (
        <View className="flex-1 bg-gray-100">
            {isLoading && displayItems.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#61b346" />
                </View>
            ) : (
                <FlatList
                    data={futureVisits} 
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    
                    ListHeaderComponent={ListHeaderComponent}
                    ListFooterComponent={ListFooterComponent}
                    ListEmptyComponent={ListEmptyComponent}
                    
                    contentContainerClassName="p-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={["#61b346"]}
                        />
                    }
                />
            )}
        </View>
    );
}