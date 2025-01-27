import { ScrollArea } from "@/components/ui/scroll-area"
import SidebarItems from "./SidebarItems"
import Generate from "./Generate"
import Icon from "./ui/icon"

import { useState } from "react"

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/dataSlice";

export default function Sidebar() {
    const hide_sidebar = useSelector((state) => state.data.hide_sidebar);
    const dispatch = useDispatch();

    return (
        <div className="flex flex-col shadow-black shadow-lg lg:z-40 z-30 h-[100%]">

            <div className={`
                w-screen fixed bottom-[95px] left-0 transition-height duration-400 bg-zinc-800
                lg:w-[450px] lg:h-[calc(100vh-126px-32px)] lg:static lg:transition-none
                ${hide_sidebar ? "h-[38px]" : "h-[70%]"}
            `}>
                <div className="lg:hidden bg-zinc-800 w-screen h-[40px] flex items-center justify-center" onClick={() => dispatch(configSlice.setValue({key: "hide_sidebar", value: !hide_sidebar}))}>
                    <Icon name="up_small_fill" className={`text-5xl ${hide_sidebar ? "" : "rotate-180"}`} />
                </div>

                <div className="bg-zinc-800 overflow-y-auto w-auto h-[calc(100%-40px)] lg:h-full">
                    <SidebarItems />
                </div>
            </div>
            
            <Generate />
        </div>
    );
}