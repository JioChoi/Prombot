import { Button } from "@/components/ui/button"
import { loadAnlas, generate } from "@/lib/NAI"

import { useDispatch, useSelector } from "react-redux";
import * as dataSlice from "@/slices/dataSlice";
import { useEffect } from "react";
import { applyPostProcessing, addHistoryItem, getDateString } from "@/lib/utils";
import { saveAs } from "file-saver";

export default function Generate({generationFunction}) {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);
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
        button = <Button id="generateButton" className="lg:w-10/12 w-[calc(100%-40px)] h-[60px] text-md text-black"
            onClick={() => {generationFunction()}}
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