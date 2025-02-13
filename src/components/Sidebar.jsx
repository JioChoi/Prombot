import { ScrollArea } from "@/components/ui/scroll-area"
import SidebarItems from "./SidebarItems"
import Generate from "./Generate"
import Icon from "./ui/icon"
import Autocomplete from "./Autocomplete"
import TagPopup from "./TagPopup"

import { useDispatch, useSelector } from "react-redux";
import * as dataSlice from "@/slices/dataSlice";
import { useEffect } from "react";

function getElements() {
    let items = document.getElementsByClassName("module-body");
    let temp = [];

    for (let item of items) {
        for (let i = 0; i < item.children.length; i++) {
            temp.push(item.children[i]);
        }
    }
    for (let item of document.getElementsByClassName("module-title")) {
        temp.push(item);
    }

    return temp;
}

export default function Sidebar() {
    const data = useSelector((state) => state.data);
    const dispatch = useDispatch();

    useEffect(() => {
        if (data.changing_parameter != "") {
            let temp = getElements();

            for (let i = 0; i < temp.length; i++) {
                if (temp[i].id != data.changing_parameter) {
                    temp[i].style.visibility = "hidden";
                }
            }
        }
        else {
            let temp = getElements();

            for (let i = 0; i < temp.length; i++) {
                temp[i].style.visibility = "visible";
            }
        }
    }, [data.changing_parameter]);

    let bg = "bg-zinc-800";
    if (data.changing_parameter != "") {
        bg = "bg-transparent";
    }

    return (
        <div className="flex flex-col shadow-black shadow-lg h-[100%]">

            <div className={`
                w-screen fixed bottom-[95px] left-0 transition-height duration-400 ${bg}
                lg:w-[450px] lg:h-[calc(100vh-126px-32px)] lg:static lg:transition-none lg:z-40 z-30
                ${data.hide_sidebar ? "h-[38px]" : "h-[70%]"}
            `} id="sidebar">
                <div className={`lg:hidden ${bg} w-screen h-[40px] flex items-center justify-center`} onClick={() => dispatch(dataSlice.setValue({key: "hide_sidebar", value: !data.hide_sidebar}))}>
                    <Icon name="up_small_fill" className={`text-5xl ${data.hide_sidebar ? "" : "rotate-180"}`} />
                </div>

                <div className={`${bg} overflow-y-auto w-auto h-[calc(100%-40px)] lg:h-full relative`}>
                    <TagPopup />
                    <Autocomplete />
                    <SidebarItems />
                </div>
            </div>
            
            <Generate />
        </div>
    );
}