import { Label } from "@/components/ui/label";
import { Input as _Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

export default function Input({value, onChange, onBlur, label="", configKey, width, type, placeholder, step, center}) {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    return (
        <div style={{width: width}}>
            {label == "" ? null : <Label htmlFor={configKey}>{label}</Label>}
            <_Input id={configKey} type={type} placeholder={placeholder} step={step} className={`w-full ${center ? "text-center" : ""}`}
                value={value != undefined ? value : config[configKey]}
                onChange={onChange != undefined ? onChange : (e) => dispatch(configSlice.setValue({ key: configKey, value: e.target.value }))}
                onBlur={onBlur != undefined ? onBlur : (e) => dispatch(configSlice.setValue({ key: configKey, value: Math.max(step, Math.round(e.target.value / step) * step) }))}
            ></_Input>
        </div>
    )
}