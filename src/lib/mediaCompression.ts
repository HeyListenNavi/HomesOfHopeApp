import { File, Paths } from "expo-file-system";
import { Audio, Image, Video, getVideoMetaData } from "react-native-compressor";
import { deleteFile } from "@/lib/utils";

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const FAMILY_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const TESTIMONY_MAX_BYTES = 20 * 1024 * 1024;
export const EVIDENCE_MAX_BYTES = 50 * 1024 * 1024;

export const MAX_VIDEO_DURATION_SECONDS = 300;
export const MAX_AUDIO_DURATION_SECONDS = 900;

export const MAX_RAW_VIDEO_INPUT_BYTES = 500 * 1024 * 1024;
export const MAX_RAW_IMAGE_INPUT_BYTES = 50 * 1024 * 1024;
export const MAX_RAW_AUDIO_INPUT_BYTES = 100 * 1024 * 1024;

export const MAX_SCANNED_PDF_PAGES = 50;

export class MediaValidationError extends Error {
    title: string;
    constructor(title: string, message: string) {
        super(message);
        this.name = "MediaValidationError";
        this.title = title;
    }
}

export const formatBytesToMB = (bytes: number): string =>
    `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const getFileSizeBytes = (uri: string, fallbackSize?: number): number => {
    try {
        const file = new File(uri);
        if (file.size && file.size > 0) {
            return file.size;
        }
    } catch {
        // Ignore and use fallback
    }
    return fallbackSize ?? 0;
};

export const safeDeleteTempFile = (uri?: string | null) => {
    if (!uri || !uri.startsWith("file://")) return;
    try {
        const file = new File(uri);
        if (file.exists) {
            file.delete();
        }
    } catch {
        // Ignore cleanup errors for non-existent or external URIs
    }
};

export const ensureCacheCopy = async (uri: string, fallbackName: string): Promise<string> => {
    if (uri.startsWith("file://")) {
        return uri;
    }
    const cleanName = fallbackName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const destination = new File(Paths.cache, `picked_${Date.now()}_${cleanName}`);
    const source = new File(uri);
    await source.copy(destination);
    return destination.uri;
};

export interface CompressImageOptions {
    uri: string;
    fileName?: string | null;
    fileSize?: number;
    maxBytes?: number;
    maxDimension?: number;
    quality?: number;
}

export interface CompressedMediaResult {
    uri: string;
    size: number;
    name: string;
    mimeType: string;
}

export const validateAndCompressImage = async ({
    uri,
    fileName,
    fileSize,
    maxBytes = DOCUMENT_MAX_BYTES,
    maxDimension = 1920,
    quality = 0.75,
}: CompressImageOptions): Promise<CompressedMediaResult> => {
    const initialSize = getFileSizeBytes(uri, fileSize);

    if (initialSize > MAX_RAW_IMAGE_INPUT_BYTES) {
        safeDeleteTempFile(uri);
        throw new MediaValidationError(
            "Imagen demasiado pesada",
            `La imagen seleccionada (${formatBytesToMB(initialSize)}) supera el límite máximo de entrada (${formatBytesToMB(MAX_RAW_IMAGE_INPUT_BYTES)}).`
        );
    }

    const baseName = (fileName || `imagen_${Date.now()}.jpg`).replace(/\.[^.]+$/, "");
    const outputName = `${baseName}.jpg`;
    let sourceUri = uri;

    let compressedUri: string;
    try {
        compressedUri = await Image.compress(sourceUri, {
            compressionMethod: "manual",
            maxWidth: maxDimension,
            maxHeight: maxDimension,
            quality,
            output: "jpg",
            returnableOutputType: "uri",
        });
    } catch {
        sourceUri = await ensureCacheCopy(uri, outputName);
        compressedUri = await Image.compress(sourceUri, {
            compressionMethod: "manual",
            maxWidth: maxDimension,
            maxHeight: maxDimension,
            quality,
            output: "jpg",
            returnableOutputType: "uri",
        });
    }

    if (sourceUri !== uri && compressedUri !== sourceUri) {
        safeDeleteTempFile(sourceUri);
    }
    if (uri !== compressedUri && uri !== sourceUri) {
        safeDeleteTempFile(uri);
    }

    const finalSize = getFileSizeBytes(compressedUri);
    if (finalSize > maxBytes) {
        safeDeleteTempFile(compressedUri);
        throw new MediaValidationError(
            "Imagen muy pesada",
            `La imagen comprimida (${formatBytesToMB(finalSize)}) aún supera el límite permitido de ${formatBytesToMB(maxBytes)}.`
        );
    }

    return {
        uri: compressedUri,
        size: finalSize,
        name: outputName,
        mimeType: "image/jpeg",
    };
};

export interface CompressVideoOptions {
    uri: string;
    fileName?: string | null;
    fileSize?: number;
    durationMs?: number | null;
    maxBytes?: number;
    maxDurationSeconds?: number;
    maxDimension?: number;
    onProgress?: (progressPercent: number) => void;
}

export const validateAndCompressVideo = async ({
    uri,
    fileName,
    fileSize,
    durationMs,
    maxBytes = EVIDENCE_MAX_BYTES,
    maxDurationSeconds = MAX_VIDEO_DURATION_SECONDS,
    maxDimension = 1920,
    onProgress,
}: CompressVideoOptions): Promise<CompressedMediaResult & { durationSeconds: number }> => {
    const initialSize = getFileSizeBytes(uri, fileSize);

    if (initialSize > MAX_RAW_VIDEO_INPUT_BYTES) {
        safeDeleteTempFile(uri);
        throw new MediaValidationError(
            "Video demasiado pesado",
            `El video seleccionado (${formatBytesToMB(initialSize)}) es demasiado grande para procesarse. Elige un video de máximo ${Math.floor(maxDurationSeconds / 60)} minutos y menor a ${formatBytesToMB(MAX_RAW_VIDEO_INPUT_BYTES)}.`
        );
    }

    let durationSeconds = durationMs && durationMs > 0 ? durationMs / 1000 : 0;

    if (durationSeconds > maxDurationSeconds) {
        safeDeleteTempFile(uri);
        const mins = (durationSeconds / 60).toFixed(1);
        const maxMins = Math.floor(maxDurationSeconds / 60);
        throw new MediaValidationError(
            "Video demasiado largo",
            `El video seleccionado dura ${mins} minutos y supera el límite máximo permitido de ${maxMins} minutos.`
        );
    }

    const baseName = (fileName || `video_${Date.now()}.mp4`).replace(/\.[^.]+$/, "");
    const outputName = `${baseName}.mp4`;
    let sourceUri = uri;

    if (durationSeconds <= 0) {
        try {
            const meta = await getVideoMetaData(sourceUri);
            if (meta?.duration && meta.duration > 0) {
                durationSeconds = meta.duration > 1000 ? meta.duration / 1000 : meta.duration;
            }
        } catch {
            // Fallback to cache copy only if direct metadata read on content:// fails
            sourceUri = await ensureCacheCopy(uri, outputName);
            try {
                const meta = await getVideoMetaData(sourceUri);
                if (meta?.duration && meta.duration > 0) {
                    durationSeconds = meta.duration > 1000 ? meta.duration / 1000 : meta.duration;
                }
            } catch {
                // Ignore
            }
        }
    }

    if (durationSeconds > maxDurationSeconds) {
        if (sourceUri !== uri) {
            safeDeleteTempFile(sourceUri);
        }
        safeDeleteTempFile(uri);
        const mins = (durationSeconds / 60).toFixed(1);
        const maxMins = Math.floor(maxDurationSeconds / 60);
        throw new MediaValidationError(
            "Video demasiado largo",
            `El video seleccionado dura ${mins} minutos y supera el límite máximo permitido de ${maxMins} minutos.`
        );
    }

    const effectiveDuration = Math.max(durationSeconds || 30, 5);
    const targetMaxBits = maxBytes * 0.82 * 8;
    const maxSafeVideoBitrate = Math.floor(targetMaxBits / effectiveDuration) - 128_000;
    const targetBitrate = Math.max(400_000, Math.min(2_500_000, maxSafeVideoBitrate));

    onProgress?.(0);
    let compressedUri: string;
    try {
        compressedUri = await Video.compress(
            sourceUri,
            {
                compressionMethod: "manual",
                maxSize: maxDimension,
                bitrate: targetBitrate,
                minimumFileSizeForCompress: 0,
                progressDivider: 5,
            },
            (progress) => {
                onProgress?.(Math.min(100, Math.round(progress * 100)));
            }
        );
    } catch {
        if (sourceUri === uri && !uri.startsWith("file://")) {
            sourceUri = await ensureCacheCopy(uri, outputName);
            compressedUri = await Video.compress(
                sourceUri,
                {
                    compressionMethod: "manual",
                    maxSize: maxDimension,
                    bitrate: targetBitrate,
                    minimumFileSizeForCompress: 0,
                    progressDivider: 5,
                },
                (progress) => {
                    onProgress?.(Math.min(100, Math.round(progress * 100)));
                }
            );
        } else {
            throw new Error("Video compression failed");
        }
    }
    onProgress?.(100);

    if (sourceUri !== uri && compressedUri !== sourceUri) {
        safeDeleteTempFile(sourceUri);
    }
    if (uri !== compressedUri && uri !== sourceUri) {
        safeDeleteTempFile(uri);
    }

    const finalSize = getFileSizeBytes(compressedUri);
    if (finalSize > maxBytes) {
        safeDeleteTempFile(compressedUri);
        throw new MediaValidationError(
            "Video muy pesado",
            `El video comprimido (${formatBytesToMB(finalSize)}) aún supera el límite permitido de ${formatBytesToMB(maxBytes)}. Intenta con un video más corto.`
        );
    }

    return {
        uri: compressedUri,
        size: finalSize,
        name: outputName,
        mimeType: "video/mp4",
        durationSeconds,
    };
};

export interface CompressAudioOptions {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number;
    durationSeconds?: number;
    maxBytes?: number;
    maxDurationSeconds?: number;
}

export const validateAndCompressAudio = async ({
    uri,
    fileName,
    mimeType,
    fileSize,
    durationSeconds,
    maxBytes = TESTIMONY_MAX_BYTES,
    maxDurationSeconds = MAX_AUDIO_DURATION_SECONDS,
}: CompressAudioOptions): Promise<CompressedMediaResult> => {
    const initialSize = getFileSizeBytes(uri, fileSize);

    if (initialSize > MAX_RAW_AUDIO_INPUT_BYTES) {
        safeDeleteTempFile(uri);
        throw new MediaValidationError(
            "Audio demasiado pesado",
            `El archivo de audio (${formatBytesToMB(initialSize)}) supera el límite máximo permitido.`
        );
    }

    if (durationSeconds && durationSeconds > maxDurationSeconds) {
        safeDeleteTempFile(uri);
        const maxMins = Math.floor(maxDurationSeconds / 60);
        throw new MediaValidationError(
            "Audio demasiado largo",
            `El audio seleccionado supera la duración máxima permitida de ${maxMins} minutos.`
        );
    }

    const outputName = fileName || `audio_${Date.now()}.m4a`;
    const localUri = await ensureCacheCopy(uri, outputName);
    const localSize = getFileSizeBytes(localUri, initialSize);

    let finalUri = localUri;
    let finalMime = mimeType || "audio/mp4";
    let finalName = outputName;

    const isUncompressedWav =
        outputName.toLowerCase().endsWith(".wav") || mimeType === "audio/wav" || mimeType === "audio/x-wav";

    if (localSize > maxBytes * 0.8 || isUncompressedWav) {
        const compressedUri = await Audio.compress(localUri, {
            quality: "medium",
            bitrate: 64000,
            samplerate: 44100,
            channels: 1,
        });
        if (compressedUri && compressedUri !== localUri) {
            safeDeleteTempFile(localUri);
            finalUri = compressedUri;
            finalMime = "audio/mp4";
            finalName = outputName.replace(/\.[^.]+$/, "") + ".m4a";
        }
    }

    const finalSize = getFileSizeBytes(finalUri, localSize);
    if (finalSize > maxBytes) {
        safeDeleteTempFile(finalUri);
        deleteFile(finalUri);
        throw new MediaValidationError(
            "Audio muy pesado",
            `El archivo de audio (${formatBytesToMB(finalSize)}) supera el límite máximo permitido de ${formatBytesToMB(maxBytes)}.`
        );
    }

    return {
        uri: finalUri,
        size: finalSize,
        name: finalName,
        mimeType: finalMime,
    };
};

export interface ValidatePdfOptions {
    uri: string;
    fileName?: string | null;
    fileSize?: number;
    maxBytes?: number;
}

export const validatePickedPdf = async ({
    uri,
    fileName,
    fileSize,
    maxBytes = DOCUMENT_MAX_BYTES,
}: ValidatePdfOptions): Promise<CompressedMediaResult> => {
    const initialSize = getFileSizeBytes(uri, fileSize);

    if (initialSize > maxBytes) {
        safeDeleteTempFile(uri);
        throw new MediaValidationError(
            "PDF demasiado pesado",
            `El documento PDF seleccionado (${formatBytesToMB(initialSize)}) supera el límite máximo permitido de ${formatBytesToMB(maxBytes)}.`
        );
    }

    const outputName = fileName || `documento_${Date.now()}.pdf`;
    const localUri = await ensureCacheCopy(uri, outputName);
    const finalSize = getFileSizeBytes(localUri, initialSize);

    if (finalSize > maxBytes) {
        safeDeleteTempFile(localUri);
        throw new MediaValidationError(
            "PDF demasiado pesado",
            `El documento PDF seleccionado (${formatBytesToMB(finalSize)}) supera el límite máximo permitido de ${formatBytesToMB(maxBytes)}.`
        );
    }

    return {
        uri: localUri,
        size: finalSize,
        name: outputName,
        mimeType: "application/pdf",
    };
};
