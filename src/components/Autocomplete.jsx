import { datasets } from "@/lib/NAI";
import { use } from "react";
import { useState, useRef, useEffect } from "react";


/*
0 : "none"
1 : "thousand"
2 : "million"
*/
const unitColor = [
    "text-foreground",
    "text-blue-500",
    "text-yellow-400",
]

/*
0 : "normal"
1 : "character"
2 : "copyright"
3 : "artist"
*/
const typeColor = [
    "text-foreground",
    "text-blue-500",
    "text-yellow-400",
    "text-green-400",
]

function checkParents(target, id) {
    if (target.id === id) {
        return true;
    }
    if (target.parentElement) {
        return checkParents(target.parentElement, id);
    }
    return false;
}

function shortenNumber(num) {
    if (num < 1000) {
        return {text: num, unit: 0};
    }
    if (num < 1000000) {
        return {text: (num / 1000).toFixed(1) + "k", unit: 1};
    }
    return {text: (num / 1000000).toFixed(1) + "m", unit: 2};
}

export default function Autocomplete() {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({x: 0, y: 0});
    const [value, setValue] = useState([]);
    const [selected, setSelected] = useState(0);
    const [range, setRange] = useState({start: 0, end: 0});
    const element = useRef(null);

    const cursor = useRef({x: 0, y: 0});

    const textInput = useRef(false);

    function setTextareaValue(val) {
        const valueSetter = Object.getOwnPropertyDescriptor(element.current, 'value').set;
        const prototype = Object.getPrototypeOf(element.current);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element.current, val);
        }
        else {
            valueSetter.call(element.current, val);
        }
        element.current.dispatchEvent(new Event('input', {bubbles: true}));
    }

    function putValue(sel) {
        let str = value[sel][0] + ", ";
        let start = range.start;
        let end = range.end;
        
        let val = element.current.value;
        let result = val.substring(0, start) + str + val.substring(end);
        setTextareaValue(result);

        element.current.focus();
        element.current.selectionStart = start + str.length;
        element.current.selectionEnd = start + str.length;
    }

    useEffect(() => {
        document.addEventListener('mousemove', (e) => {
            cursor.current = {x: e.clientX, y: e.clientY};
        });
    }, [])
    useEffect(() => {
        function inputFn(e) {
            if (e.target.tagName === 'TEXTAREA') {
                textInput.current = true;

                let value = e.target.value;
                let start = e.target.selectionStart;

                let str = value.substring(0, start);
                let last = Math.max(str.lastIndexOf('\n'), str.lastIndexOf(','), str.lastIndexOf('{'), str.lastIndexOf('['), str.lastIndexOf('<'), str.lastIndexOf('|'));

                if (str.lastIndexOf(', ') != -1) {
                    last = Math.max(last, str.lastIndexOf(', ') + 1);
                }
                
                str = str.substring(last + 1);
                str = str.trim();

                element.current = e.target;
                setRange({start: last + 1, end: start});

                if (str.length == 0) {
                    setVisible(false);
                    return;
                }

                let rect = e.target.getBoundingClientRect();
                
                setVisible(true);
                setPosition({x: rect.x, y: e.target.offsetTop + rect.height - 2});
                setSelected(0);

                let temp = [];
                let exact = datasets.whitelist.find((v) => v[0] === str);
                if (exact) {
                    temp.push(exact);
                }

                for (let i = 0; i < datasets.whitelist.length; i++) {
                    if (datasets.whitelist[i][0].includes(str) && datasets.whitelist[i][0] != str) {
                        temp.push(datasets.whitelist[i]);
                        if (temp.length >= 5) {
                            break;
                        }
                    }
                }

                // for (let i = 0; i < temp.length; i++) {
                //     let type = 0;

                //     if (datasets.character.includes(temp[i][0])) {
                //         type = 1;
                //     }
                //     else if (datasets.copyright.includes(temp[i][0])) {
                //         type = 2;
                //     }
                //     else if (datasets.artist.includes(temp[i][0])) {
                //         type = 3;
                //     }

                //     temp[i] = {value: temp[i], type: type};
                // }

                setValue(temp);
            }
        };

        function selectionChangeFn(e) {
            if (e.target.tagName === 'TEXTAREA') {
                if (!textInput.current) {
                    setVisible(false);
                }
                
                textInput.current = false;
            }
        }
        function keydownFn(e) {
            if (visible && value.length != 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelected(Math.min(selected + 1, value.length - 1));
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelected(Math.max(selected - 1, 0));
                }
                if (e.key == 'Enter' || e.key == 'Tab') {
                    e.preventDefault();
                    setVisible(false);
                    putValue(selected);
                }
            }
        }
        function focusOutFn(e) {
            if (!checkParents(document.elementFromPoint(cursor.current.x, cursor.current.y), "autocomplete")) {
                setVisible(false);
            }
        }


        document.addEventListener('input', inputFn);
        document.addEventListener('selectionchange', selectionChangeFn);
        document.addEventListener('keydown', keydownFn);
        document.addEventListener('focusout', focusOutFn);

        return () => {
            document.removeEventListener('input', inputFn);
            document.removeEventListener('selectionchange', selectionChangeFn);
            document.removeEventListener('keydown', keydownFn);
            document.removeEventListener('focusout', focusOutFn);
        }
    }, [visible, selected, value]);

    return (
        <>
            <div id="autocomplete" className={`absolute z-50 w-48 border-2 border-zinc-600
                ${visible && value.length != 0 ? "visible" : "hidden"}
            `} style={{top: position.y, left: position.x}}>
                {value.map((v, i) => {
                    let shorten = shortenNumber(v[1]);
                    return (
                        <div className={`odd:bg-[#2b2b2e] even:bg-zinc-800 w-[100%] px-2 py-[6px] hover:bg-zinc-700 hover:cursor-pointer flex flex-row justify-between items-center
                            ${selected == i ? "border-[1px] border-zinc-400 border-dotted" : "border-[1px] border-transparent"}`}
                            onClick={(e) => {
                                putValue(i);
                            }
                        }>
                            <div key={i} className={`w-[calc(100%-30px)] text-sm`}>{v[0]}</div>
                            <div className={`text-[10px] w-[30px] align-middle ${unitColor[shorten.unit]}`}>{shorten.text}</div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};