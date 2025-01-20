import { ScrollArea } from "@/components/ui/scroll-area"
import SidebarItems from "./SidebarItems"
import Generate from "./Generate"
import Icon from "./ui/icon"

import { useState } from "react"

export default function Sidebar() {
    const [hidden, setHidden] = useState(false);

    return (
        <div className="flex flex-col shadow-black shadow-sm z-40">

            <div className={`
                w-screen fixed bottom-[95px] left-0 transition-height duration-400
                lg:w-[450px] lg:h-[calc(100vh-126px)] lg:static lg:transition-none
                ${hidden ? "h-[38px]" : "h-[70%]"}
            `}>
                <div className="lg:hidden bg-zinc-800 w-screen h-[40px] flex items-center justify-center" onClick={() => setHidden(!hidden)}>
                    <Icon name="up_small_fill" className={`text-5xl ${hidden ? "" : "rotate-180"}`} />
                </div>

                <div className="bg-zinc-800 overflow-y-auto w-auto h-[calc(100%-40px)] lg:h-full">
                    <SidebarItems />
                </div>
            </div>
            
            <Generate />
        </div>
    );
}