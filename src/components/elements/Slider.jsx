import { Slider as _Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useContext, useEffect, useId, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

import { Button } from "../ui/button";

export default function Slider({label, configKey, min, max, step, unit="", reset=false, changeOnDrag=true, onValueCommit=null}) {
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    const id = useId();

    const [sliderValue, setSliderValue] = useState(config[configKey]);

    useEffect(() => {
        if (config[configKey] !== sliderValue)
            setSliderValue(config[configKey]);
    }, [config[configKey]]);

    useEffect(() => {
        if (sliderValue !== config[configKey] && changeOnDrag)
            dispatch(configSlice.setValue({ key: configKey, value: sliderValue }));
    }, [sliderValue]);

    return (
        <>
            <div className="hover:cursor-pointer">
                <Label htmlFor={id}>{label}{sliderValue} {unit}</Label>
                <div className="flex items-center space-x-3">
                    <_Slider min={min} max={max} step={step} id={id}
                        value={[sliderValue]}
                        onValueChange={(value)=>{
                            setSliderValue(value[0]);
                        }}
                        onValueCommit={(value)=>{
                            if (onValueCommit) {
                                onValueCommit(value[0]);
                            }
                            if (!changeOnDrag) {
                                dispatch(configSlice.setValue({ key: configKey, value: value[0] }));
                            }
                        }}
                    />

                    {reset && <Button className="w-12 h-7" variant="ghost" onClick={() => {
                        dispatch(configSlice.setValue({ key: configKey, value: 0 }));
                    }}>Reset</Button>}
                </div>
            </div>
        </>
    );
}