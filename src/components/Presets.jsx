import Icon from "./ui/icon"
import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from 'react-redux';
import * as configSlice from "@/slices/configSlice";
import * as dataSlice from "@/slices/dataSlice";
import * as NAI from "@/lib/NAI";
import axios from "axios";
import { config } from '../lib/NAI';

function checkParents(target, id) {
    if (target.id === id) {
        return true;
    }
    if (target.parentElement) {
        return checkParents(target.parentElement, id);
    }
    return false;
}

export default function Presets() {
    const [open, setOpen] = useState(false);

    const data = useSelector((state) => state.data);
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();

    const closeOnClick = useRef((e) => {
        if (!checkParents(e.target, "presets") && !checkParents(e.target, "presetsButton")) {
            setOpen(false);
        }
    });

    useEffect(() => {
        if (open == false) {
            document.removeEventListener("click", closeOnClick.current);
        }
    }, [open]);

    return (
        <>
        <div id="presetsButton" className="font-bold text-sm flex items-center justify-center gap-1 fixed top-[47px] z-10 lg:left-[465px] left-[15px] w-[40px] h-[40px] bg-zinc-800 rounded-xl shadow-lg hover:cursor-pointer hover:brightness-110"
            onClick={()=>{
                setOpen(!open);

                document.addEventListener("click", closeOnClick.current);
            }}
        >
            <Icon name="settings-2-line" className="text-3xl"/>
        </div>

        <div id="presets" className={`fixed top-[35px] w-52 h-[calc(100%-35px)] bg-zinc-800 z-40 shadow-sr transition-left duration-400
            ${open ? "left-[0px] lg:left-[450px]" : "left-[-13rem] lg:left-[242px]"}
        `}>
            <div className="w-full h-12 flex items-center justify-between border-b-[2px]">
                <h1 className="text-lg font-bold ml-4">Presets</h1>
                <div onClick={() => {setOpen(false)}}>
                    <Icon name='left-small-fill' className="text-5xl hover:brightness-75 hover:cursor-pointer"/>
                </div>
            </div>
            <div className="w-full h-[calc(100%-48px-48px)] overflow-y-auto">
                <div className="flex items-center justify-between border-b-[2px] h-11 hover:bg-zinc-900 hover:cursor-pointer">
                    <div className="pl-4 w-full h-full flex items-center"
                        onClick={() => {
                            dispatch(configSlice.loadFromString("{}"));
                            setOpen(false);
                            dispatch(dataSlice.setValue({key: "hide_sidebar", value: false}));
                        }}
                    >Default</div>
                </div>

                {
                    data.presets.map((preset, index) => {
                        return (
                            <div key={index} className="flex items-center justify-between border-b-[2px] bg-zinc-800 h-11 hover:brightness-75 hover:cursor-pointer">
                                <div className="pl-4 w-full h-full flex items-center"
                                    onClick={() => {
                                        dispatch(configSlice.loadFromString(preset.data));
                                        setOpen(false);
                                        dispatch(dataSlice.setValue({key: "hide_sidebar", value: false}));
                                    }}
                                >{preset.name}</div>
                                <div className="hover:cursor-pointer min-h-11 min-w-11 flex justify-center items-center hover:brightness-75"
                                    onClick={() => {
                                        let yes = confirm(`Are you sure you want to delete the preset "${preset.name}"?`);
                                        setOpen(false);
                                        
                                        if(yes) {
                                            axios.post(NAI.host + "/deletePreset", {
                                                id: preset.id,
                                                uid: data.uid,
                                            }).then((res) => {
                                                NAI.loadPresets(data.uid).then((presets) => {
                                                    dispatch(dataSlice.setValue({key: "presets", value: presets}));
                                                });
                                            });
                                        }
                                    }}
                                >
                                    <Icon name="delete-2-line" className="text-xl"/>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className="w-full h-[48px] flex justify-center items-center bg-zinc-800 hover:brightness-90 hover:cursor-pointer border-t-2"
                onClick={() => {
                    let name = prompt("Enter the name of the preset");
                    setOpen(false);
                    
                    axios.post(NAI.host + "/addPreset", {
                        name: name,
                        data: JSON.stringify(config),
                        uid: data.uid,
                    }).then((res) => {
                        NAI.loadPresets(data.uid).then((presets) => {
                            dispatch(dataSlice.setValue({key: "presets", value: presets}));
                        });
                    });
                }}
            >Add Preset</div>
        </div>
        </>
    )
}