import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetView,
    BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, type ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

interface BottomSheetProps {
    children: ReactNode;
    snapPoints?: (string | number)[];
    scrollable?: boolean;
    onDismiss?: () => void;
    ref?: React.Ref<BottomSheetModal>;
}

const BottomSheet = ({
    children,
    snapPoints,
    scrollable = true,
    onDismiss,
    ref,
}: BottomSheetProps) => {
    const { top } = useSafeAreaInsets();

    const hasSnapPoints = snapPoints !== undefined;
    const bottomSheetSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-0.5}
            />
        ),
        [],
    );

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={bottomSheetSnapPoints}
            enableDynamicSizing={!hasSnapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            topInset={top}
            onDismiss={onDismiss}
            backgroundStyle={styles.sheet}
            handleIndicatorStyle={styles.handle}
        >
            {scrollable ? (
                <BottomSheetScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {children}
                </BottomSheetScrollView>
            ) : (
                <BottomSheetView style={styles.content}>
                    {children}
                </BottomSheetView>
            )}
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    sheet: {
        borderRadius: 28,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
    },
    handle: {
        backgroundColor: "#d1d5db",
        width: 40,
        height: 4,
    },
    content: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    scrollContent: {
        paddingBottom: 24,
    },
});

export default BottomSheet;