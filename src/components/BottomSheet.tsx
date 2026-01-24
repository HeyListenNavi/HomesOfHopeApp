import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ReactNode, useCallback, useMemo, Ref } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomSheetProps {
    children: ReactNode;
    ref?: Ref<BottomSheetModal>;
    snapPoints?: (string | number)[];
}

const BottomSheet = ({ 
    children, 
    ref, 
    snapPoints = ["75%", "90%"],
}: BottomSheetProps) => {
    const { top, bottom } = useSafeAreaInsets();

    const bottomSheetSnapPoints = useMemo(() => {
        return snapPoints;
    }, []); 

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
            snapPoints={bottomSheetSnapPoints}
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
};

export default BottomSheet;