import { Button } from "@/components/ui/button"
import { generate, loadAnlas } from "@/lib/NAI"

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import * as dataSlice from "@/slices/dataSlice";

export default function Generate() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);
    const config = useSelector((state) => state.config);

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
            onClick={async ()=>{
                let url = await generate(data.token, config, (message) => {
                    dispatch(dataSlice.setValue({ key: "generate_button_text", value: message }));
                }, () => {
                    dispatch(dataSlice.setValue({ key: "generating", value: true }));
                });

                console.log(url);
                dispatch(dataSlice.setValue({ key: "current_image", value: url }));
                dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
                dispatch(dataSlice.setValue({ key: "generating", value: false }));
                
                let anlas = await loadAnlas(data.token);
                dispatch(dataSlice.setValue({key: "anlas", value: anlas}));
            }}
        >Generate</Button>;
    }

    return (
        <div className="bg-zinc-800 flex items-center justify-center outline-zinc-800 outline-2 z-50 w-screen h-[95px]
            lg:w-[450px] lg:h-[126px] lg:border-t-2 lg:border-border lg:outline-none
        ">
            {button}
        </div>
    );
}