import { TouchableOpacity, View, Platform } from "react-native";
import { Image } from "expo-image";
import React from "react";
import Boxicon from "@/components/Boxicons";
import { Text } from "@/components/ui/text";
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

interface LocalFilePreviewerProps {
    file: { name: string; uri: string };
    onRemove: () => void;
    containerClassName?: string;
}

const LocalFilePreviewer = ({ file, onRemove, containerClassName = "flex-row items-center gap-3 bg-gray-50 rounded-2xl pl-4 pr-2 py-2 border border-gray-100 mt-1" }: LocalFilePreviewerProps) => {
    const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i) != null || file.uri.startsWith('data:image') || !file.name.match(/\.[a-zA-Z]+$/);

    return (
        <View className={containerClassName}>
            <Dialog className="flex-1">
                <DialogTrigger asChild>
                    <TouchableOpacity className="flex-1 flex-row items-center gap-3" activeOpacity={0.7}>
                        <View className="h-10 w-10 bg-primary/10 rounded-xl items-center justify-center shrink-0">
                            <Boxicon name="bxs-file" size={20} color="#61b346" />
                        </View>
                        <Text
                            className="flex-1 font-medium text-gray-700 text-base"
                            numberOfLines={1}
                        >
                            {file.name}
                        </Text>
                    </TouchableOpacity>
                </DialogTrigger>
                
                <DialogContent className="w-[95vw] max-w-none bg-white rounded-3xl overflow-hidden p-0">
                    <DialogHeader className="px-5 pt-5 pb-3">
                        <DialogTitle className="text-lg text-primary font-bold text-center" numberOfLines={1}>
                            {file.name}
                        </DialogTitle>
                    </DialogHeader>

                    <View style={{ height: 480 }}>
                        {isImage ? (
                            <Image
                                source={{ uri: file.uri }}
                                style={{ flex: 1, width: "100%", height: "100%" }}
                                contentFit="contain"
                                transition={200}
                            />
                        ) : Platform.OS === 'ios' ? (
                            <WebView
                                source={{ uri: file.uri }}
                                style={{ flex: 1 }}
                                cacheEnabled={true}
                                originWhitelist={["*"]}
                                allowFileAccess={true}
                                allowUniversalAccessFromFileURLs={true}
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
                                            var url = '${file.uri}';
                                            var pdfjsLib = window['pdfjs-dist/build/pdf'];
                                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

                                            var loadingTask = pdfjsLib.getDocument(url);
                                            loadingTask.promise.then(function(pdf) {
                                                document.getElementById('loading').style.display = 'none';
                                                var container = document.getElementById('pdf-container');
                                                
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
                                    baseUrl: 'file://',
                                }}
                                style={{ flex: 1 }}
                                originWhitelist={["*"]}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                nestedScrollEnabled={true}
                                setBuiltInZoomControls={true}
                                displayZoomControls={false}
                                allowFileAccess={true}
                                allowFileAccessFromFileURLs={true}
                                allowUniversalAccessFromFileURLs={true}
                            />
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

            <TouchableOpacity
                onPress={onRemove}
                className="p-2 active:opacity-60"
                accessibilityRole="button"
                accessibilityLabel="Quitar archivo"
            >
                <Boxicon name="bxs-trash" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
};

export default LocalFilePreviewer;
