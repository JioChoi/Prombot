import { useDispatch, useSelector } from "react-redux";
import { addHistoryItem, createBlob, getContainSize, zipAndSave } from "@/lib/utils";
import { useEffect } from "react";
import { config } from "@/lib/NAI";
import HistoryItem from "@/components/elements/HistoryItem";
import { useState } from "react";
import Icon from "@/components/ui/icon";
import Drawer from "@/components/elements/Drawer";

export default function History() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);
    const [selected, setSelected] = useState(0);
    const [show, setShow] = useState(false);

    const [size, setSize] = useState({width: 0, height: 0});

    // useEffect(() => {
    //     (async () => {
    //         let url = await createBlob(true);
    //         let url2 = await createBlob(false);

    //         addHistoryItem(dispatch, url, config);
    //         addHistoryItem(dispatch, url2, config);
    //         addHistoryItem(dispatch, url, config);
    //         addHistoryItem(dispatch, url2, config);
    //         addHistoryItem(dispatch, url, config);
    //     })();
    // }, []);

    useEffect(() => {
        function resizeFunction(e) {
            const lgwidth = 320 + 168;
            if (data.history.length == 0) {
                return;
            }

            const imageMod = 0.85;
            let lg = window.innerWidth > 1024;
            let size = getContainSize({width: (window.innerWidth - lg * lgwidth) * imageMod, height: window.innerHeight  * imageMod}, {width: data.history[selected].exif.width, height: data.history[selected].exif.height});

            if (lg) {
                size.width += lgwidth - 168;
            }

            setSize({
                width: size.width,
                height: size.height
            });
        }

        resizeFunction();
        window.addEventListener('resize', resizeFunction);

        return () => {
            window.removeEventListener('resize', resizeFunction);
        }
    }, [selected, data.history]);

    useEffect(() => {
        if (data.history.length == 0 || selected == 0) {
            return;
        }
        setSelected(selected - 1);
    }, [data.history]);

    let animation = data.generating ? "generating" : "";

    return (
        <div className="bg-zinc-900 w-full h-[calc(100%-32px)] flex flex-row">
        <div className={`w-full h-full flex items-center justify-center lg:w-[calc(100%-168px)] ${animation}`}>
            {data.history.length != 0 && 
            <div className="relative shadow-lg lg:flex" style={{width: size.width + 'px', height: size.height + 'px'}}>
                <img src={data.history[selected].img} className="w-full h-full hover:cursor-pointer lg:hover:cursor-auto lg:w-auto" alt="History Item" 
                    onClick={() => {
                        setShow(!show);
                    }}
                />
                <div className={`absolute top-0 left-0 bg-black bg-opacity-70 w-full h-full backdrop-blur-md ${show ? "visible" : "invisible"}
                    lg:relative lg:visible lg:w-[320px] lg:bg-opacity-100
                `}>
                    <div className="w-full h-[28px] flex items-center justify-between px-[1px] bg-black bg-opacity-30
                        lg:hidden">
                        <p className="text-sm ml-2 [text-shadow:_#00000040_0_0_10px]">Generation Information</p>
                        <div onClick={() => {
                                setShow(!show);
                        }}>
                            <Icon name="close_line" className="text-lg bg-black w-[28px] h-[28px] flex justify-center items-center bg-opacity-0 hover:bg-opacity-20 hover:cursor-pointer rounded-md"/>
                        </div>
                    </div>
                    <div className="overflow-y-auto transparent-scrollbar w-full h-[calc(100%-28px)] p-3 space-y-4 break-all">
                        {InfoItem("Prompt", [data.history[selected].exif.prompt])}
                        {InfoItem("Negative", [data.history[selected].exif.uc])}
                        {InfoItem("Resolution", [data.history[selected].exif.width + "x" + data.history[selected].exif.height])}
                        {InfoItem("Sampler", [data.history[selected].exif.sampler])}
                        {InfoItem("Steps", [data.history[selected].exif.steps])}
                        {InfoItem("Seed", [data.history[selected].exif.seed])}
                        {InfoItem("Noise Scheduler", [data.history[selected].exif.noise_schedule])}
                        {InfoItem("Prompt Guidance", [data.history[selected].exif.scale])}
                        {InfoItem("Prompt Guidance Rescale", [data.history[selected].exif.cfg_rescale])}
                        {InfoItem("SMEA & DYN", [(data.history[selected].exif.sm ? "SMEA" : "None") + (data.history[selected].exif.dyn ? ", DYN" : "")])}
                        {InfoItem("Post Processing", [
                            "Brightness: " + data.history[selected].exif.config.brightness,
                            "Expousure: " + data.history[selected].exif.config.exposure,
                            "Contrast: " + data.history[selected].exif.config.contrast,
                            "Saturation: " + data.history[selected].exif.config.saturation,
                            "Temperature: " + data.history[selected].exif.config.temperature,
                            "Tint: " + data.history[selected].exif.config.tint,
                            "Shadows: " + data.history[selected].exif.config.shadows,
                            "Highlights: " + data.history[selected].exif.config.highlights,
                            "Sharpness: " + data.history[selected].exif.config.sharpness,
                        ])}
                    </div>
                </div>
            </div>}
        </div>

        <Drawer 
        listType="image"
        items={data.history}
        right={true}
        title="History"
        id="history"
        icon="history_anticlockwise_line"
        buttonLabel="Download All"
        selected={selected}
        width={168}
        backgroundColor="bg-zinc-800 lg:bg-zinc-900"
        className="lg:!m-0 lg:!relative lg:!top-0 lg:!h-full lg:!w-[168px]
                    lg:!shadow-3xl"
        buttonClassName="lg:hidden"
        hideArrowIcon={true}
        onButtonClick={() => {
            zipAndSave(data.history.map((item) => item.img));
        }}

        onClick={(item, index) => {
            setSelected(index);
            return false;
        }}
        />
        </div>
    );
}

function InfoItem(title, value) {
    return (
        <div className="">
            <p className="text-zinc-50 text-sm font-medium mb-1 [text-shadow:_#00000060_0_0_10px]">{title}</p>
            {
                value.map((v, i) => {
                    return <p className="text-zinc-50 text-sm ml-2 [text-shadow:_#00000060_0_0_10px]">{v}</p>
                })
            }
        </div>
    );
}