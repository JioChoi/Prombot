import { Textarea as _Textarea }from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import { useMemo, useRef, useState } from "react";
import useResizeObserver from "use-resize-observer";

export default function Textarea({label, configKey, placeholder, autocomplete, height}) {
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

        for (let i = 0; i < config[configKey].length; i++) {
            let char = config[configKey][i];

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
    }, [config[configKey]]);

    return (
        <div>
            <Label htmlFor={configKey}>{label}</Label>

            <div className="relative block w-full">
                <_Textarea ref={observer.ref} id={configKey} className={`min-h-20`} placeholder={placeholder} autocomplete={autocomplete}
                    onChange={(e) => dispatch(configSlice.setValue({ key: configKey, value: e.target.value }))}
                    value={config[configKey]}
                    style={{height: height}}
                    onScroll={(e) => setScroll(e.target.scrollTop)}
                />
                <div className="fakeTextarea absolute top-0 left-0 min-h-[60px] w-full border border-transparent bg-transparent px-3 py-2 text-base md:text-sm scroll pointer-events-none whitespace-pre-wrap break-words overflow-y-scroll"
                    style={{
                        height: observer.height ? observer.height + 18 : 0,
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