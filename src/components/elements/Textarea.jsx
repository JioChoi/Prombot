import { Textarea as _Textarea }from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import { useRef } from "react";

export default function Textarea({label, configKey, placeholder, autocomplete, height}) {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    return (
        <div>
            <Label htmlFor={configKey}>{label}</Label>
            <_Textarea id={configKey} className={`h-${height} min-h-20`} placeholder={placeholder} autocomplete={autocomplete}
                onChange={(e) => dispatch(configSlice.setValue({ key: configKey, value: e.target.value }))}
                value={config[configKey]}
            />
        </div>
    )
}