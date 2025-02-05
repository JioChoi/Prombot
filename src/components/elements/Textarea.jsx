import * as UI from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import { useRef } from "react";

export default function Textarea(props) {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    return (
        <div>
            <Label htmlFor={props.configKey}>{props.title}</Label>
            <UI.Textarea id={props.configKey} className={`h-${props.height} min-h-20`} placeholder={props.placeholder} autocomplete={props.autocomplete}
                onChange={(e) => dispatch(configSlice.setValue({ key: props.configKey, value: e.target.value }))}
                value={config[props.configKey]}
            />
        </div>
    )
}