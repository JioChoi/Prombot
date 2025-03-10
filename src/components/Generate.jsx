import { Button } from "@/components/ui/button"
import { loadAnlas, generate } from "@/lib/NAI"

import { useDispatch, useSelector } from "react-redux";
import * as dataSlice from "@/slices/dataSlice";
import { useEffect } from "react";
import { applyPostProcessing, addHistoryItem, getDateString } from "@/lib/utils";
import { saveAs } from "file-saver";
import ToggleButton from "@/components/ui/toggleButton";
import Icon from "@/components/ui/icon";
import * as configSlice from "@/slices/configSlice";

export default function Generate({generationFunction}) {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);
    const config = useSelector((state) => state.config);
    let button;

    if (data.generate_button_text != "") {
        button = <Button className="w-[calc(100%-66px)] h-full text-md text-black" disabled>{data.generate_button_text}</Button>;
    }
    else if (data.token == null) {
        button = <Button className="w-[calc(100%-66px)] h-full text-md text-black"
            onClick={()=>{
                dispatch(dataSlice.setValue({ key: "login_popup", value: true }));
            }}
        >Login with Novel AI Account</Button>;
    }
    else {
        button = <Button id="generateButton" className="w-[calc(100%-66px)] h-full text-md text-black"
           onClick={() => {generationFunction()}}
        >Generate</Button>
    }

    button = <div className="lg:w-[calc(88%)] w-[calc(100%-40px)] h-[60px] flex justify-between">
        {button}
        <Button className="w-[60px] h-full flex items-center justify-center"
            onClick={() => {
                dispatch(configSlice.setValue({ key: "enable_automation", value: !config.enable_automation }));
            }}>
            {
                config.enable_automation ?
                <Icon name="repeat_line" className="text-2xl text-black"/> :
                <h1 className="text-xl text-black font-normal font-mono leading-none">1</h1>
            }
        </Button>
    </div>


    return (
        <div className="bg-zinc-800 flex items-center justify-center outline-zinc-800 outline-2 z-[35] lg:z-40 w-screen h-[95px] fixed bottom-0 left-0
            lg:w-[450px] lg:h-[126px] lg:border-t-2 lg:border-border lg:outline-none lg:static
        ">
            {button}
        </div>
    );
}