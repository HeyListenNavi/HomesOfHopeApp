import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ReactNode, forwardRef, useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ReusableBottomSheetEditorProps {
    children: ReactNode;
}

const ReusableBottomSheetEditor = forwardRef<
    BottomSheetModal,
    ReusableBottomSheetEditorProps
>(function ReusableBottomSheetEditor({ children }, ref) {
    const snapPoints = useMemo(() => ["75%", "90%"], []);
    const { top, bottom } = useSafeAreaInsets();

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            topInset={top}
            bottomInset={bottom}
        >
            <BottomSheetScrollView keyboardShouldPersistTaps="handled">
                {children}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

export default ReusableBottomSheetEditor;
