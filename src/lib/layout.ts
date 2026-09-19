import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_CLEARANCE = 88;
const SCREEN_TOP_PADDING = 24;

export const useTabBarClearance = () => {
    const insets = useSafeAreaInsets();
    return TAB_BAR_CLEARANCE + insets.bottom;
};

export const useScreenTopPadding = () => SCREEN_TOP_PADDING;
