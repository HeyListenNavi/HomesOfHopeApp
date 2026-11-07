import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
    CompressedMediaResult,
    CompressAudioOptions,
    CompressImageOptions,
    CompressVideoOptions,
    MediaValidationError,
    ValidatePdfOptions,
    validateAndCompressAudio,
    validateAndCompressImage,
    validateAndCompressVideo,
    validatePickedPdf,
} from "@/lib/mediaCompression";

export function useFileCompression() {
    const [isCompressing, setIsCompressing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleError = (error: unknown, fallbackMessage: string) => {
        if (error instanceof MediaValidationError) {
            Alert.alert(error.title, error.message);
        } else {
            Alert.alert("Error de procesamiento", fallbackMessage);
        }
    };

    const compressImage = useCallback(
        async (
            options: CompressImageOptions & { onSuccess?: (result: CompressedMediaResult) => void }
        ): Promise<CompressedMediaResult | null> => {
            setIsCompressing(true);
            setProgress(0);
            try {
                const { onSuccess, ...compressOpts } = options;
                const result = await validateAndCompressImage(compressOpts);
                onSuccess?.(result);
                setProgress(100);
                return result;
            } catch (error) {
                handleError(error, "No se pudo comprimir la imagen seleccionada.");
                return null;
            } finally {
                setIsCompressing(false);
            }
        },
        []
    );

    const compressVideo = useCallback(
        async (
            options: Omit<CompressVideoOptions, "onProgress"> & {
                onSuccess?: (result: CompressedMediaResult & { durationSeconds: number }) => void;
            }
        ): Promise<(CompressedMediaResult & { durationSeconds: number }) | null> => {
            setIsCompressing(true);
            setProgress(0);
            try {
                const { onSuccess, ...compressOpts } = options;
                const result = await validateAndCompressVideo({
                    ...compressOpts,
                    onProgress: (p) => setProgress(p),
                });
                onSuccess?.(result);
                return result;
            } catch (error) {
                handleError(error, "No se pudo procesar o comprimir el video seleccionado.");
                return null;
            } finally {
                setIsCompressing(false);
                setProgress(0);
            }
        },
        []
    );

    const compressAudio = useCallback(
        async (
            options: CompressAudioOptions & { onSuccess?: (result: CompressedMediaResult) => void }
        ): Promise<CompressedMediaResult | null> => {
            setIsCompressing(true);
            setProgress(0);
            try {
                const { onSuccess, ...compressOpts } = options;
                const result = await validateAndCompressAudio(compressOpts);
                onSuccess?.(result);
                setProgress(100);
                return result;
            } catch (error) {
                handleError(error, "No se pudo procesar el archivo de audio seleccionado.");
                return null;
            } finally {
                setIsCompressing(false);
            }
        },
        []
    );

    const validatePdf = useCallback(
        async (
            options: ValidatePdfOptions & { onSuccess?: (result: CompressedMediaResult) => void }
        ): Promise<CompressedMediaResult | null> => {
            setIsCompressing(true);
            try {
                const { onSuccess, ...validateOpts } = options;
                const result = await validatePickedPdf(validateOpts);
                onSuccess?.(result);
                return result;
            } catch (error) {
                handleError(error, "No se pudo validar el archivo PDF seleccionado.");
                return null;
            } finally {
                setIsCompressing(false);
            }
        },
        []
    );

    return {
        isCompressing,
        progress,
        compressImage,
        compressVideo,
        compressAudio,
        validatePdf,
    };
}
