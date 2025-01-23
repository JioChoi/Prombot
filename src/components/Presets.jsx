import Icon from "./ui/icon"
import { useState } from "react"
import { useSelector } from 'react-redux';

export default function Presets() {
    const [open, setOpen] = useState(false);

    const presets = useSelector((state) => state.data.presets);

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
            <div className="w-full h-12 flex items-center justify-between border-b-[2px]">
                <h1 className="text-lg font-bold ml-4">Presets</h1>
                <div onClick={() => {setOpen(false)}}>
                    <Icon name='left-small-fill' className="text-5xl hover:brightness-75 hover:cursor-pointer"/>
                </div>
            </div>
            <div className="w-full h-[calc(100%-48px)] overflow-y-auto">
                {
                    presets.map((preset, index) => {
                        return (
                            <div key={index} className="flex items-center justify-between border-b-[2px] h-11 hover:bg-zinc-900 hover:cursor-pointer">
                                <div className="pl-4 w-full h-full flex items-center"
                                    onClick={() => {
                                        console.log(preset);
                                    }}
                                >{preset.name}</div>
                                <div className="hover:cursor-pointer min-h-11 min-w-11 flex justify-center items-center hover:brightness-75"
                                    onClick={() => {
                                        console.log("delete");
                                    }}
                                >
                                    <Icon name="delete-2-line" className="text-xl"/>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
        </>
    )
}