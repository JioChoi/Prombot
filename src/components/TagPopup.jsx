import { useEffect, useRef, useState } from "react";
import Icon from "./ui/icon";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

function checkParent(element, id) {
    if (element.id == id) {
        return true;
    }
    if (element.parentElement) {
        return checkParent(element.parentElement, id);
    }
    return false;
}

function boxToPointCollision(box, point) {
    return point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height;
}

export default function TagPopup() {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    const element = useRef(null);
    const clientPosition = useRef({ x: 0, y: 0 });

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

    function changeWeight(amt) {
        let start = element.current.selectionStart;
        let end = element.current.selectionEnd;

        let range = getRange(element.current, element.current.value, start, end);
        if (!range) {
            return;
        }

        let value = element.current.value.substring(range.begin, range.end);

        let l = element.current.value.substring(range.begin - 1, range.begin);
        let r = element.current.value.substring(range.end, range.end + 1);

        if (l == "{" && r == "}" && amt < 0) {
            setTextareaValue(element.current.value.substring(0, range.begin - 1) + value + element.current.value.substring(range.end + 1));
            element.current.selectionStart = start - 1;
            element.current.selectionEnd = end - 1;
        }
        else if (l == "[" && r == "]" && amt > 0) {
            setTextareaValue(element.current.value.substring(0, range.begin - 1) + value + element.current.value.substring(range.end + 1));
            element.current.selectionStart = start - 1;
            element.current.selectionEnd = end - 1;
        }
        else {
            if (amt > 0) {
                setTextareaValue(element.current.value.substring(0, range.begin) + "{" + value + "}" + element.current.value.substring(range.end));
                element.current.selectionStart = start + 1;
                element.current.selectionEnd = end + 1;
            }
            else {
                setTextareaValue(element.current.value.substring(0, range.begin) + "[" + value + "]" + element.current.value.substring(range.end));
                element.current.selectionStart = start + 1;
                element.current.selectionEnd = end + 1;
            }
        }
    }

    useEffect(() => {
        let previousElement = null;
        let cursor = { x: 0, y: 0 };
        let on = false;
        let prvSelection = { start: 0, end: 0 };

        function scrollFunction(e) {
            on = false;
            setVisible(false);
            removeStyles(element.current);
        }

        function selectionChangeFn(e) {
            if (e.target.tagName == "TEXTAREA" && e.target.getAttribute("autocomplete") == "on") {
                console.log("SELECTION CHANGE", e.target.selectionStart, e.target.selectionEnd);
    
                let value = e.target.value;
                let start = e.target.selectionStart;
                let end = e.target.selectionEnd;

                prvSelection = { start, end };

                element.current = e.target;
                let rect = getRangeRect(e.target, value, start, end);
                if (!rect) {
                    on = false;
                    setVisible(false);
                    removeStyles(element.current);
                    return;
                }
            
                let maxX = document.getElementById("sidebar").getBoundingClientRect().width - 60 - 15;
                setPosition({ x: Math.min(rect.x, maxX) - 2, y: rect.y - 4 });
                clientPosition.current = { x: Math.min(rect.x, maxX) - 2, y: rect.clientY - 4 - 30 };

                on = true;
                setVisible(true);

                if (previousElement) {
                    previousElement.removeEventListener("scroll", scrollFunction);
                }
                previousElement = e.target;
                e.target.addEventListener("scroll", scrollFunction, { capture: true, passive: true, once: true });
            }
        }

        function blurFunction(e) {
            console.log("BLUR");

            if (!checkParent(document.elementFromPoint(cursor.x, cursor.y), "tagPopup")) {
                on = false;
                setVisible(false);
                removeStyles(element.current);
            }
            else {
                // document.activeElement.blur();
                // setTimeout(() => {
                //     e.target.focus();
                //     e.target.selectionStart = prvSelection.start;
                //     e.target.selectionEnd = prvSelection.end;
                // }, 10);
                console.log(e.target);

            }
        }
        function mouseMoveFunction(e) {
            cursor = { x: e.clientX, y: e.clientY };

            // if (!boxToPointCollision({ x: clientPosition.current.x - 10, y: clientPosition.current.y - 10, width: 80, height: 66 }, cursor)) {
            //     setVisible(false);
            // }
        }
        function touchMoveFunction(e) {
            cursor = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }

        document.addEventListener('selectionchange', selectionChangeFn);
        document.addEventListener("blur", blurFunction, true);
        document.addEventListener("mousemove", mouseMoveFunction);
        document.addEventListener("touchmove", touchMoveFunction);

        document.addEventListener("keydown", (e) => {
            if(e.ctrlKey) {
                document.getElementById("prompt_beg").focus();
            }
        });

        return () => {
            document.removeEventListener('selectionchange', selectionChangeFn);
            document.removeEventListener("blur", blurFunction, true);
            document.removeEventListener("mousemove", mouseMoveFunction);
            document.removeEventListener("touchmove", touchMoveFunction);
        }
    }, []);


    if (!visible) return null;

    return (
        <>
        <div id="tagPopup" className='absolute top-0 left-0 w-auto h-[30px] z-[70] bg-zinc-800 shadow-xl rounded-lg border-2 border-zinc-600 hover:cursor-pointer pointer-events-auto
            flex flex-row select-none
        '
            style={{
                top: position.y - 30 + "px",
                left: position.x + "px"
            }}
        >
            <div className="flex flex-row justify-center items-center h-full aspect-square hover:brightness-75 bg-zinc-800"
                onClick={
                    () => {
                        changeWeight(-1);
                    }
                }
            >
                <Icon name="minimize_fill" className="text-xl text-zinc-100" />
            </div>
            <div className="flex flex-row justify-center items-center h-full aspect-square hover:brightness-75 bg-zinc-800"
                onClick={
                    () => {
                        changeWeight(1);
                    }
                }
            >
                <Icon name="add_fill" className="text-xl text-zinc-100" />
            </div>
        </div>
        </>
    );
}

function getRange(element, value, begin, end, includeWeight=false) {
    begin--;
    // Extract comma L
    let l = Math.max(
        value.lastIndexOf(",", begin) != -1 ? value.lastIndexOf(",", begin) + 1 : 0,
        value.lastIndexOf("\n", begin) != -1 ? value.lastIndexOf("\n", begin) + 1 : 0,
        value.lastIndexOf("|", begin) != -1 ? value.lastIndexOf("|", begin) + 1 : 0,
    );
    // Extract comma R
    let r = Math.min(
        value.indexOf(",", end) != -1 ? value.indexOf(",", end) : value.length,
        value.indexOf("\n", end) != -1 ? value.indexOf("\n", end) : value.length,
        value.indexOf("|", end) != -1 ? value.indexOf("|", end) : value.length,
    );

    if (!includeWeight) {
        // Extract weight L
        l = Math.max(
            value.lastIndexOf("{", r) != -1 ? value.lastIndexOf("{", r) + 1 : l,
            value.lastIndexOf("[", r) != -1 ? value.lastIndexOf("[", r) + 1 : l,
            l
        )
        // Extract weight R
        r = Math.min(
            value.indexOf("}", l) != -1 ? value.indexOf("}", l) : r,
            value.indexOf("]", l) != -1 ? value.indexOf("]", l) : r,
            r
        );
    }

    // Trim Left
    while (l < r && value.charAt(l) == " ") {
        l++;
    }
    // Trim Right
    while (r > l && value.charAt(r - 1) == " ") {
        r--;
    }
    
    if (l >= r) {
        return null;
    }

    return {
        begin: l,
        end: r
    };
}

function removeStyles(element) {
    // let fakeTextarea = element.parentNode.querySelector(".fakeTextarea").querySelectorAll("span");

    // for (let i = 0; i < fakeTextarea.length; i++) {
    //     fakeTextarea[i].style.color = "transparent";
    // }
}

function getRangeRect(element, value, begin, end) {
    let range = getRange(element, value, begin, end, true);
    if (!range) {
        return null;
    }

    begin = range.begin;

    let fakeTextarea = element.parentNode.querySelector(".fakeTextarea").querySelectorAll("span");

    removeStyles(element);
    // for (let i = begin; i < range.end; i++) {
    //     fakeTextarea[i].style.color = "#cffafe";
    // }

    let rect = fakeTextarea[begin].getBoundingClientRect();
    let eleY = element.parentNode.getBoundingClientRect().y;

    return {
        x: rect.x,
        y: rect.y - (eleY - 32) + element.parentNode.offsetTop - 32,
        clientY: rect.y,
        width: rect.width,
        height: rect.height
    };
}