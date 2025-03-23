import Tabs from "@/pages/Tabs";
import { useEffect, useRef, useState } from "react";
import { extractExif, extractStealthExif } from "@/lib/utils";
import { getExternalImage } from "@/lib/utils";

async function processItems(items) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type == "text/uri-list") {
                item.getAsString((s) => { resolve(s); });
                return;
            }
        }
        resolve("");
    });
}

export default function Exif() {
    const drag = useRef(null);
    const loading = useRef(null);
    const file = useRef(null);
    const [image, setImage] = useState(null);
    const [exif, setExif] = useState(null);

    useEffect(() => {
        async function getExif(url) {
            setImage(url);
            let exif = await extractExif(url, true);
            if (exif == undefined || exif == null) {
                exif = await extractStealthExif(url);
            }
            console.log(exif);
            if (exif != null) {
                setExif(exif);
            }
        }
        
        if (drag.current != null) {
            function dragOver(e) {
                e.preventDefault();
                drag.current.style.opacity = 1;
            }

            async function drop(e) {
                try {
                    e.preventDefault();
                    drag.current.style.opacity = 0;
                    let url = "";
    
                    setExif(null);
                    setImage(null);
                    
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
                        loading.current.style.opacity = 1;
                        url = await processItems(e.dataTransfer.items);

                        if(!url.startsWith("http") && !url.startsWith("https")) {
                            loading.current.style.opacity = 0;
                            return;
                        }
                        let blob = await getExternalImage(url, "blob");
                        if (blob != null) {
                            url = URL.createObjectURL(blob);
                        }
                    }
    
                    if (url != "") {
                        await getExif(url);
                    }
                } catch(e) {
                    console.log(e);
                    loading.current.style.opacity = 0;
                }
                loading.current.style.opacity = 0;
            }

            function dragLeave(e) {
                drag.current.style.opacity = 0;
            }

            function upload(e) {
                // Read image file
                const data = e.target.files[0];
                console.log(data);
                document.getElementById("upload").reset();
                const reader = new FileReader();
                reader.onload = function (e) {
                    const buffer = e.target.result;
                    const blob = new Blob([buffer], { type: data.type });
                    const url = URL.createObjectURL(blob);
                    getExif(url);
                };
                reader.readAsArrayBuffer(data);
            }
    
            document.addEventListener("dragover", dragOver);
            document.addEventListener("dragenter", dragOver);
            document.addEventListener("dragleave", dragLeave);
            document.addEventListener("drop", drop);
            file.current.addEventListener("change", upload);
    
            return () => {
                document.removeEventListener("dragover", dragOver);
                document.removeEventListener("dragenter", dragOver);
                document.removeEventListener("dragleave", dragLeave);
                document.removeEventListener("drop", drop);
                file.current.removeEventListener("change", upload);
            }
        }
    }, [drag]);

    function field(title, value) {
        return (<>
        <h1 className="mt-5 text-sm font-bold">{title}</h1>
        <p className="text-sm break-all text-zinc-200">{value}</p>
        </>)
    }

    function showExif() {
        
        if (exif.Software == "NovelAI") {
            const data = JSON.parse(exif.Comment);

            let characterPrompts = [];
            if (data.v4_prompt != null) {
                characterPrompts = data.v4_prompt.caption.char_captions.map((c, i) => {
                    return (<>
                        {field(`Character ${i + 1} Positive`, c.char_caption)}
                        {field(`Character ${i + 1} Negative`, data.v4_negative_prompt.caption.char_captions[i].char_caption)}
                    </>)
                });
            }
    
            return (
                <div className="w-[80vw]">
                    {field("Software", exif.Software)}
                    {field("Source", exif.Source)}
    
                    {field("Positive", data.prompt)}
                    {characterPrompts}
                    {field("Negative", data.uc)}
                    {field("Size", `${data.width}x${data.height}`)}
                    {field("Steps", data.steps)}
                    {field("Prompt Guidance", data.scale)}
                    {field("Prompt Guidance Rescale", data.cfg_rescale)}
                    {field("Sampler", `${data.sampler} (${data.noise_schedule})`)}
    
                    {field("Seed", data.seed)}

                    {field("SMEA", data.sm ? "True" : "False")}
                    {field("DYN", data.sm_dyn ? "True" : "False")}
    
                </div>
            )
        }
        else {
            let data = exif.parameters.split("\n");
            let addit = data[2].split(", ");
            let etc = [];

            for (let i = 0; i < addit.length; i++) {
                let temp = addit[i].split(": ");
                etc.push(
                    field(temp[0], temp[1])
                )
            }
            return (
                <div className="w-[80vw]">
                    {field("Positive", data[0])}
                    {field("Negative", data[1].split(": ")[1])}
                    {etc}
                </div>
            )
        }

    }


    return (
        <>
            <Tabs tab={3} setTab={null} singlePage={true}/>
            
            <div ref={drag} className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 justify-center items-center flex text-xl font-medium pointer-events-none opacity-0">Drop!</div>
            <div ref={loading} className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 justify-center items-center flex text-xl font-medium pointer-events-none opacity-0">Loading...</div>

            <div className="bg-zinc-900 w-full h-[calc(100%-32px)] flex flex-row">
                {image == null ?
                <div className="w-full h-full flex flex-col items-center justify-center space-y-1">
                    <h1 className="text-3xl text-zinc-400 font-medium">Ultimate Exif Viewer</h1>
                    <p className="text-zinc-500">Drag an image here or upload...</p>

                    <div className="pt-3">
                        <form id="upload">
                            <input ref={file} type="file" accept="image/*" className="hidden" id="img"/>
                        </form>
                        <label htmlFor="img" className="bg-zinc-700 hover:brightness-90 hover:cursor-pointer text-zinc-200 text-sm font-medium py-1.5 px-2.5 rounded-md">Upload Image</label>
                    </div>
                </div>
                    :
                <div className="w-full h-full flex flex-col items-center space-y-1 overflow-y-scroll py-12">
                    <img src={image} className="w-[80vw] h-[80vw] max-w-80 max-h-80 object-contain bg-zinc-800"/>
                    {exif != null ? showExif() : "No EXIF data found."}
                </div>}
            </div>
        </>
    )
}