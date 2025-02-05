import { Slider as _Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useContext, useId } from "react";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

export default function Slider({label, configKey, min, max, step, unit=""}) {
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    const id = useId();

    return (
        <>
            <div className="hover:cursor-pointer">
                <Label htmlFor={id}>{label}{config[configKey]} {unit}</Label>
                <_Slider min={min} max={max} step={step} id={id}
                    value={[config[configKey]]}
                    onValueChange={(value)=>{
                        dispatch(configSlice.setValue({ key: configKey, value: value[0] }));
                    }}
                />
            </div>
        </>
    );
}