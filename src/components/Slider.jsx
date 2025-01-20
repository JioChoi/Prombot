import * as ui from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useContext, useId } from "react";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

export default function Slider({label, keyname, min, max, step}) {
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    const id = useId();

    return (
        <>
            <div className="hover:cursor-pointer">
                <Label htmlFor={id}>{label}{config[keyname]}</Label>
                <ui.Slider min={min} max={max} step={step} id={id}
                    value={[config[keyname]]}
                    onValueChange={(value)=>{
                        dispatch(configSlice.setValue({ key: keyname, value: value[0] }));
                    }}
                />
            </div>
        </>
    );
}