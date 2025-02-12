import { Button } from "@/components/ui/button"
import { generate, loadAnlas } from "@/lib/NAI"

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import * as dataSlice from "@/slices/dataSlice";
import { useEffect } from "react";
import { applyPostProcessing } from "@/lib/utils";

export default function Generate() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);
    const config = useSelector((state) => state.config);

    async function startGeneration() {
        let _config = config;
        let url = await generate(data.token, _config, (message) => {
            dispatch(dataSlice.setValue({ key: "generate_button_text", value: message }));
        }, () => {
            dispatch(dataSlice.setValue({ key: "generating", value: true }));
        });

        dispatch(dataSlice.setValue({ key: "result_image", value: url }));
        url = await applyPostProcessing(url, _config, false);
        dispatch(dataSlice.setValue({ key: "current_image", value: url }));
        dispatch(dataSlice.setValue({ key: "width", value: _config.width }));
        dispatch(dataSlice.setValue({ key: "height", value: _config.height }));

        dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
        dispatch(dataSlice.setValue({ key: "generating", value: false }));
        
        console.log(config);

        if (config.automatically_download) {
            let date = new Date();
            date =  (date.getFullYear() % 2000).toString() + 
                    (date.getMonth() < 10 ? '0' : '') + date.getMonth().toString() +
                    (date.getDate() < 10 ? '0' : '') + date.getDate().toString() +
                    '_' +
                    (date.getHours() < 10 ? '0' : '') + date.getHours().toString() +
                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes().toString() +
                    (date.getSeconds() < 10 ? '0' : '') + date.getSeconds().toString();

            let a = document.createElement('a');
            a.href = url;
            a.download = `${date}.png`;
            a.click();
        }

        if (config.enable_automation) {
            dispatch(dataSlice.setValue({ key: "delay", value: config.delay * 1000 }));
        }

        let anlas = await loadAnlas(data.token);
        dispatch(dataSlice.setValue({key: "anlas", value: anlas}));
    }

    useEffect(() => {
        if (data.delay > 0) {
            setTimeout(() => {
                if (!config.enable_automation) {
                    dispatch(dataSlice.setValue({ key: "delay", value: -1 }));
                    dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
                }
                else {
                    dispatch(dataSlice.setValue({ key: "generate_button_text", value: `Waiting... (${data.delay / 1000}s)` }));
                    dispatch(dataSlice.setValue({ key: "delay", value: data.delay - 100 }));
                }                
            }, 100);
        }

        if (data.delay == 0) {
            dispatch(dataSlice.setValue({ key: "delay", value: -1 }));
            dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
            startGeneration();
        }
    }, [data.delay]);

    let button;

    if (data.generate_button_text != "") {
        button = <Button className="lg:w-10/12 w-[calc(100%-40px)] h-[60px] text-md text-black" disabled>{data.generate_button_text}</Button>;
    }
    else if (data.token == null) {
        button = <Button className="lg:w-10/12 w-[calc(100%-40px)] h-[60px] text-md text-black"
            onClick={()=>{
                dispatch(dataSlice.setValue({ key: "login_popup", value: true }));
            }}
        >Login with Novel AI Account</Button>;
    }
    else {
        button = <Button className="lg:w-10/12 w-[calc(100%-40px)] h-[60px] text-md text-black"
            onClick={() => {startGeneration()}}
        >Generate</Button>;
    }

    return (
        <div className="bg-zinc-800 flex items-center justify-center outline-zinc-800 outline-2 z-[35] lg:z-40 w-screen h-[95px] fixed bottom-0 left-0
            lg:w-[450px] lg:h-[126px] lg:border-t-2 lg:border-border lg:outline-none lg:static
        ">
            {button}
        </div>
    );
}