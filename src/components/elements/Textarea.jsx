import { Textarea as _Textarea }from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import { useMemo, useRef, useState } from "react";
import useResizeObserver from "use-resize-observer";
import DisableButton from "@/components/ui/disableButton";

export default function Textarea({label=null, configKey, placeholder, autocomplete, height, width="100%", set=null, get=null, index=0, resize=true, disableMinHeight=false, className="", disableButton=false, disableKey=""}) {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    const observer = useResizeObserver();
    const [scroll, setScroll] = useState(0);
    const ref = useRef(null);

    if (ref.current != null) {
        ref.current.scrollTop = scroll;
    }
 
    const elements = useMemo(() => {
        let ele = [];
        let buffer = "";

        function addBuffer() {
            if (buffer != "") {
                addChar(buffer);
                buffer = "";
            }
        }
        function addChar(char) {
            ele.push(
                <span>{char}</span>
            );
        }

        const value = get != null ? get() : config[configKey];

        for (let i = 0; i < value.length; i++) {
            let char = value[i];

            if (char != '\n') {
                addChar(char);
            }
            else {
                ele.push(<span><br /></span>);
            }
        }
        ele.push(<span><br /></span>);
        addBuffer();


        return ele;
    }, [get != null ? get() : config[configKey]]);

    return (
        <div>
            <div className="flex justify-between items-end">
                {label != null && <Label htmlFor={configKey + index}>{label}</Label>}
                {disableButton ? <DisableButton configKey={disableKey} className="mb-1" /> : null}
            </div>

            <div className={`relative block`} style={{width: width, minWidth: width}}>
                <_Textarea ref={observer.ref} id={configKey + index} className={`${disableMinHeight ? "" : "min-h-20"} ${!resize && "resize-none"} ${className}`} placeholder={placeholder} autocomplete={autocomplete}
                    onChange={(e) => set != null ? set(e.target.value) : dispatch(configSlice.setValue({ key: configKey, value: e.target.value }))}
                    value={get != null ? get() : config[configKey]}
                    style={{height: height}}
                    onScroll={(e) => setScroll(e.target.scrollTop)}
                    disabled={disableButton && config[disableKey]}
                />
                <div className={`fakeTextarea absolute top-0 left-0 min-h-[60px] border border-transparent bg-transparent px-3 py-2 text-base md:text-sm scroll pointer-events-none whitespace-pre-wrap break-words overflow-y-scroll`}
                    style={{
                        height: observer.height ? observer.height + 18 : 0,
                        width: width,
                        minWidth: width,
                        color: "transparent",
                        // color: "rgba(255, 0, 255, 0.5)",

                        fontKerning: "auto",
                        fontOpticalSizing: "auto",
                        fontSizeAdjust: "none",
                        fontStretch: "99%",
                        fontStyle: "normal",
                        fontVariant: "normal",
                        letterSpacing: "normal",
                        textAlign: "start",
                        textIndent: "0px",
                        textShadow: "none",
                        textTransform: "none",
                        wordSpacing: "0px"
                    }}
                    ref={ref}
                >
                    {elements}
                </div>
            </div>
        </div>
    )
}