import { Textarea as _Textarea }from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import useResizeObserver from "use-resize-observer";
import { useState, useRef, useMemo } from "react";


export default function Textarea({label, configKey, placeholder, autocomplete, height}) {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);
    const [ scroll, setScroll ] = useState(0);

    const observer = useResizeObserver();
    const ref = useRef(null);

    if(ref.current)
        ref.current.scrollTop = scroll;

    const str = useMemo(() => process(config[configKey]), [config[configKey]]);

    return (
        <div>
            <Label htmlFor={configKey}>{label}</Label>
        
            <div className="relative">
                <div ref={ref} className={`absolute top-0 right-0 pointer-events-none overflow-hidden border border-transparent
                                w-full bg-transparent px-3 py-2 pr-[22px] text-base md:text-sm text-zinc-100 break-words font-normal`}
                                style={{height: observer.height + 18}}>
                    {str}
                </div>
                <_Textarea ref={observer.ref} id={configKey}  placeholder={placeholder} autocomplete={autocomplete}
                    className={`min-h-20 z-10 relative text-transparent caret-white font-normal`}
                    onChange={(e) => dispatch(configSlice.setValue({ key: configKey, value: e.target.value }))}
                    value={config[configKey]}
                    onScroll={(e) => setScroll(e.target.scrollTop)}
                    style={{height: height}}
                    // style={{color: "rgba(255, 0, 255, 0.5)"}}
                />
            </div>
            
        </div>
    )
}

{
    let className="text-amber-200"
}

function process(str) {
    function put(color = null, str, weight = null) {
        if (weight != null) {
            result.push(
            <span style={{ color: "transparent", position: "relative"}}>
                {str}
                
                <span style={{ color: color, fontWeight: weight, position: "absolute", left: "0" }}>
                    {str}
                </span>
            </span>
            );
        }
        else {
            result.push(<span style={{
                color: color,
            }}>{str}</span>);
        }
    }

    const colors = {
        COMMA: "#fbbf24",
    }

    let buffer = "";
    let result = [];

    let pweight = 0;
    let nweight = 0;

    for(let i = 0; i < str.length; i++) {
        buffer += str[i];

        if (str[i] == ',') {
            put(colors.COMMA, str[i], "800");
        }
        else {
            put(null, str[i]);
        }

        if (str[i] == "\n") {
            result.push(<br />);
            buffer = "";
        }
    }
    result.push(<br />);
    
    return result;
}