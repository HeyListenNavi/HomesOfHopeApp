import { TouchableOpacity, View, ActivityIndicator, Platform, Linking } from "react-native";
import React, { useState } from "react";
import Boxicon from "@/components/Boxicons";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { WebView } from "react-native-webview";
import api, { API_URL } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface DocumentPreviewerProps {
    label?: string;
    description?: string;
    needsReview?: boolean;
    url?: string;
    documentId?: number;
}

const DocumentPreviewer = ({
    label = "Documento",
    description,
    needsReview = false,
    url,
    documentId,
}: DocumentPreviewerProps) => {
    const token = useAuthStore.getState().token;
    const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(url);
    const [loadingUrl, setLoadingUrl] = useState(false);

    // Fetch the document's URL from the show endpoint if not already known.
    // The show controller appends Storage::url(file_path) which is not present
    // on eagerly-loaded document relations.
    const resolveUrl = async () => {
        if (resolvedUrl || !documentId) return;
        setLoadingUrl(true);
        try {
            const { data } = await api.get(`/documents/${documentId}`);
            setResolvedUrl(data.url);
        } catch {
            // leave resolvedUrl undefined — UI will show "Enlace no disponible"
        } finally {
            setLoadingUrl(false);
        }
    };

    const downloadUrl = resolvedUrl;

    const absoluteUrl = downloadUrl?.startsWith('http') 
        ? downloadUrl 
        : downloadUrl 
            ? API_URL.replace(/\/api$/, '') + downloadUrl 
            : undefined;

    // Heuristic to detect images
    const isImage = downloadUrl?.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i) != null;

    return (
        <Dialog>
            <View className="gap-3">
                <View>
                    <View className="flex-row gap-2 items-center">
                        <Boxicon name="bxs-file" color="#9ca3af" size={18} />
                        <Label className="py-0.5 text-gray-500 font-bold">
                            {label}
                        </Label>
                    </View>

                    {description && (
                        <Text className="text-gray-400 text-sm">
                            {description}
                        </Text>
                    )}
                </View>

                <DialogTrigger asChild>
                    <TouchableOpacity
                        className="bg-white items-center justify-center py-5 rounded-2xl border-2 border-gray-200 border-dashed flex-row gap-3"
                        activeOpacity={0.7}
                        onPress={resolveUrl}
                    >
                        <Boxicon
                            name="bxs-glasses"
                            size={26}
                            color="#61b346"
                        />
                        <Text className="text-primary text-base font-bold">
                            Ver {label}
                        </Text>
                    </TouchableOpacity>
                </DialogTrigger>

                {needsReview && (
                    <View className="flex-row gap-2 bg-white rounded-2xl">
                        <View className="flex-1 flex-row gap-2">
                            <TouchableOpacity className="flex-1 bg-gray-100 px-2 py-4 rounded-2xl flex-row justify-center gap-2">
                                <Text className="text-gray-500">
                                    <Boxicon name="bxs-camera" size={24} />
                                </Text>
                            </TouchableOpacity>
                            <Dialog className="flex-1">
                                <DialogTrigger asChild>
                                    <TouchableOpacity className="bg-red-50 px-2 py-4 rounded-2xl flex-row justify-center gap-2">
                                        <Text className="text-red-500">
                                            <Boxicon
                                                name="bxs-x-circle"
                                                size={24}
                                            />
                                        </Text>
                                    </TouchableOpacity>
                                </DialogTrigger>
                                <DialogContent className="w-[90vw] max-w-none bg-white rounded-3xl px-6 py-8">
                                    <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                                        Rechazar documento
                                    </DialogTitle>
                                </DialogContent>
                            </Dialog>
                        </View>
                        <Dialog className="flex-1">
                            <DialogTrigger asChild>
                                <TouchableOpacity className="bg-primary px-2 py-4 rounded-2xl flex-row items-center justify-center gap-2">
                                    <Text className="text-white font-bold">
                                        Aprobar
                                    </Text>
                                </TouchableOpacity>
                            </DialogTrigger>
                        </Dialog>
                    </View>
                )}
            </View>

            <DialogContent className="w-[95vw] max-w-none bg-white rounded-3xl overflow-hidden p-0">
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle className="text-lg text-primary font-bold text-center">
                        {label}
                    </DialogTitle>
                </DialogHeader>

                <View style={{ height: 480 }}>
                    {absoluteUrl ? (
                        isImage ? (
                            <WebView
                                source={{
                                    html: `<!DOCTYPE html><html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh"><img src="${absoluteUrl}" style="max-width:100%;max-height:100vh;object-fit:contain"/></body></html>`,
                                    baseUrl: API_URL,
                                }}
                                style={{ flex: 1 }}
                                cacheEnabled={true}
                                domStorageEnabled={true}
                                javaScriptEnabled={true}
                                originWhitelist={["*"]}
                                // Pass auth header for protected routes
                                injectedJavaScriptBeforeContentLoaded={
                                    token
                                        ? `
                                    (function() {
                                        var orig = XMLHttpRequest.prototype.open;
                                        XMLHttpRequest.prototype.open = function() {
                                            orig.apply(this, arguments);
                                            this.setRequestHeader('Authorization', 'Bearer ${token}');
                                        };
                                    })();
                                `
                                        : undefined
                                }
                            />
                        ) : Platform.OS === 'ios' ? (
                            <WebView
                                source={{ uri: absoluteUrl }}
                                style={{ flex: 1 }}
                                cacheEnabled={true}
                                originWhitelist={["*"]}
                            />
                        ) : (
                            <WebView
                                source={{
                                    html: `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
                                        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
                                        <style>
                                            body { background-color: #f3f4f6; margin: 0; padding: 10px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; overflow-y: auto; }
                                            canvas { max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 16px; background-color: white; }
                                            #loading { font-family: sans-serif; color: #6b7280; margin-top: 20px; text-align: center; }
                                        </style>
                                    </head>
                                    <body>
                                        <div id="loading">Cargando PDF...</div>
                                        <div id="pdf-container"></div>
                                        <script>
                                            // pdf.js setup
                                            var url = '${absoluteUrl}';
                                            var pdfjsLib = window['pdfjs-dist/build/pdf'];
                                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

                                            var loadingTask = pdfjsLib.getDocument(url);
                                            loadingTask.promise.then(function(pdf) {
                                                document.getElementById('loading').style.display = 'none';
                                                var container = document.getElementById('pdf-container');
                                                
                                                // Render all pages
                                                for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                                                    pdf.getPage(pageNum).then(function(page) {
                                                        var scale = 1.5;
                                                        var viewport = page.getViewport({scale: scale});
                                                        
                                                        var canvas = document.createElement('canvas');
                                                        var context = canvas.getContext('2d');
                                                        canvas.height = viewport.height;
                                                        canvas.width = viewport.width;
                                                        
                                                        container.appendChild(canvas);
                                                        
                                                        var renderContext = {
                                                            canvasContext: context,
                                                            viewport: viewport
                                                        };
                                                        page.render(renderContext);
                                                    });
                                                }
                                            }, function (reason) {
                                                document.getElementById('loading').innerText = 'Error al cargar el PDF';
                                                console.error(reason);
                                            });
                                        </script>
                                    </body>
                                    </html>
                                    `,
                                    baseUrl: API_URL,
                                }}
                                style={{ flex: 1 }}
                                originWhitelist={["*"]}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                nestedScrollEnabled={true}
                                setBuiltInZoomControls={true}
                                displayZoomControls={false}
                            />
                        )
                    ) : loadingUrl ? (
                        <View className="flex-1 items-center justify-center gap-3">
                            <ActivityIndicator size="large" color="#61b346" />
                            <Text className="text-gray-400 font-medium">
                                Cargando documento...
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-1 items-center justify-center gap-3">
                            <Boxicon name="bx-file" size={64} color="#d1d5db" />
                            <Text className="text-gray-400 font-medium">
                                Enlace no disponible
                            </Text>
                        </View>
                    )}
                </View>

                <DialogFooter className="p-4">
                    <DialogClose asChild>
                        <TouchableOpacity className="p-4 rounded-xl bg-gray-100 w-full items-center">
                            <Text className="text-gray-500 font-semibold">
                                Cerrar
                            </Text>
                        </TouchableOpacity>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentPreviewer;