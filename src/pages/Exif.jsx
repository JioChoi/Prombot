import Tabs from "@/pages/Tabs";
import { useEffect, useRef } from "react";
import { extractExif } from "@/lib/utils";

async function processItems(items) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type == "text/uri-list") {
                item.getAsString((s) => { resolve(s); });
                break;
            }
            else {
                resolve("");
            }
        }
    });
}

export default function Exif() {
    const drag = useRef(null);

    useEffect(() => {
        if (drag.current != null) {
            function dragOver(e) {
                e.preventDefault();
                drag.current.style.opacity = 1;
            }

            async function drop(e) {
                e.preventDefault();
                drag.current.style.opacity = 0;
                let url = "";

                if (e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.type == "image/png") {
                        await (async () => {
                            return new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = function (e) {
                                    const buffer = e.target.result;
                                    const blob = new Blob([buffer], { type: file.type });
                                    url = URL.createObjectURL(blob);
                                    resolve();
                                };
                                reader.readAsArrayBuffer(file);
                            });
                        })();
                    }
                }
                else {
                    url = await processItems(e.dataTransfer.items);
                }

                if (url != "") {
                    let exif = extractExif(url);
                    console.log(exif);
                }
            }
    
            document.addEventListener("dragover", dragOver);
            document.addEventListener("dragenter", dragOver);
            document.addEventListener("drop", drop);
    
            return () => {
                document.removeEventListener("dragover", dragOver);
                document.removeEventListener("dragenter", dragOver);
                document.removeEventListener("drop", drop);
            }
        }
    }, [drag]);


    return (
        <>
            <Tabs tab={3} setTab={null} singlePage={true}/>
            
            <div ref={drag} className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 justify-center items-center flex text-xl font-medium pointer-events-none opacity-0">Drop!</div>

            <div className="bg-zinc-900 w-full h-[calc(100%-32px)] flex flex-row">
                <div className="w-full h-full flex flex-col items-center justify-center space-y-1">
                    <h1 className="text-3xl text-zinc-400 font-medium">Image Exif Viewer</h1>
                    <p className="text-zinc-500">Drag an image here or upload...</p>

                    <div className="pt-3">
                        <input type="file" accept="image/*" className="hidden" id="img"/>
                        <label htmlFor="img" className="bg-zinc-700 hover:brightness-90 hover:cursor-pointer text-zinc-200 text-sm font-medium py-1.5 px-2.5 rounded-md">Upload Image</label>
                    </div>
                </div>
            </div>
        </>
    )
}