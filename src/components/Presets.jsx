import Icon from "./ui/icon"
import { useState } from "react"

export default function Presets() {
    const [open, setOpen] = useState(false);

    return (
        <>
        <div className="font-bold text-sm flex items-center justify-center gap-1 fixed top-[47px] z-10 lg:left-[465px] left-[15px] w-[40px] h-[40px] bg-zinc-800 rounded-xl shadow-lg hover:cursor-pointer hover:brightness-110"
            onClick={()=>{setOpen(!open)}}
        >
            <Icon name="settings-2-line" className="text-3xl"/>
        </div>

        <div className={`fixed top-[35px] w-52 h-[calc(100%-35px)] bg-zinc-800 z-40 shadow-sr transition-left duration-400
            ${open ? "left-[0px]" : "left-[-13rem]"}
        `}>

        </div>
        </>
    )
}