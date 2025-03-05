import Textarea from "@/components/elements/Textarea";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import Icon from "@/components/ui/icon";
import { useState } from "react";

export default function CharacterPrompt({id}) {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    const [positive, setPositive] = useState(true);

    let position = config.character_prompts[id].center;

    return (<>
        <div className="w-full">
            <div className="mb-[1px] flex justify-between content-center">
                <div className="flex items-center space-x-2">
                    <h1 className="text-md font-semibold">{`Character ${id + 1}`}</h1>
                    <Icon name="delete_2_line" className="text-lg hover:cursor-pointer hover:brightness-75" onClick={() => {
                        dispatch(configSlice.removeCharacterPrompt(id));
                    }}/>
                </div>
                <div className="flex items-center">
                    <Icon name="up_line" className={`text-xl ${id > 0 ? "hover:bg-zinc-700 hover:cursor-pointer" : "brightness-50"}`} onClick={() => {
                        if (id > 0) {
                            dispatch(configSlice.swapCharacterPrompt({a: id, b: id - 1}));
                        }
                    }}/>
                    <Icon name="down_line" className={`text-xl ${id < config.character_prompts.length - 1 ? "hover:bg-zinc-700 hover:cursor-pointer" : "brightness-50"}`} onClick={() => {
                        if (id < config.character_prompts.length - 1) {
                            dispatch(configSlice.swapCharacterPrompt({a: id, b: id + 1}));
                        }
                    }}/>
                </div>
            </div>

            <div className="w-full flex flex-row justify-between">
                <div className="w-[14px]">
                    <Icon name="add_fill" className={`w-[17px] text-sm h-[45px] flex justify-start p-[1px] items-center hover:cursor-pointer rounded-sm rounded-e-none rounded-bl-none text-zinc-300 ${positive ? "bg-input" : "bg-zinc-800 hover:brightness-125"}`}
                        onClick={() => {
                            setPositive(true);
                        }}
                    />
                    <Icon name="minimize_fill" className={`w-[17px] text-sm h-[45px] flex justify-start p-[1px] items-center hover:cursor-pointer rounded-sm rounded-e-none rounded-tl-none text-zinc-300 ${positive ? "bg-zinc-800 hover:brightness-125" : "bg-input"}`}
                        onClick={() => {
                            setPositive(false);
                        }}
                    />
                </div>
                <div className="w-[calc(100%-94px-14px)]">
                    <Textarea configKey="character_prompt" label={null} placeholder={positive ? "Positive Prompt" : "Negative Prompt"} autocomplete="on" height="90px" index={id} resize={false}
                        className={`rounded-s-none`}
                        set={(value) => {
                            if (positive) {
                                dispatch(configSlice.setCharacterPrompt({id: id, key: "prompt", value: value }));
                            }
                            else {
                                dispatch(configSlice.setCharacterPrompt({id: id, key: "uc", value: value }));
                            }
                        }}
                        get={() => {
                            if (positive) {
                                return config.character_prompts[id].prompt;
                            }
                            else {
                                return config.character_prompts[id].uc;
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-5 gap-[1px]">
                    {Array(25).fill(0).map((_, index) => {
                        const x = index % 5;
                        const y = Math.floor(index / 5);

                        const xpos = Number((0.2 * (x + 1) - 0.1).toFixed(1));
                        const ypos = Number((0.2 * (y + 1) - 0.1).toFixed(1));
                        
                        return <div key={index} className={`w-[17px] h-[17px] border-[1px] rounded-sm ${position.x == xpos && position.y == ypos ? "bg-zinc-600 border-zinc-600" : "bg-zinc-800 border-zinc-700 hover:cursor-pointer hover:bg-zinc-700"}`}
                            onClick={() => {
                                dispatch(configSlice.setCharacterPrompt({id: id, key: "center", value: {x: xpos, y: ypos} }));
                            }}
                        ></div>
                    })}
                </div>
            </div>
        </div>
    </>)
}