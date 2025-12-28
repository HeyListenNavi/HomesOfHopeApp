import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const StepContainer = ({ children }: { children: React.ReactNode }) => (
    <KeyboardAwareScrollView
        contentContainerClassName="gap-6 p-6 pb-32"
        showsVerticalScrollIndicator={false}
    >
        {children}
    </KeyboardAwareScrollView>
);

export default StepContainer;
