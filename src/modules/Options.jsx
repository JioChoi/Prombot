import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Checkbox from "@/components/elements/Checkbox"
import { useContext } from "react";
import ModuleTitle from "@/components/elements/ModuleTitle";
import ModuleBody from "@/components/elements/ModuleBody";

import Slider from '@/components/elements/Slider';

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import CheckboxGroup from "@/components/elements/CheckboxGroup";

import Dropdown from "@/components/elements/Dropdown";

export default function Options() {
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    
    function setResolution(value) {
        if(value === "custom") return;

        let [width, height] = value.split("x");
        dispatch(configSlice.setValue({ key: "width", value: Number(width) }));
        dispatch(configSlice.setValue({ key: "height", value: Number(height) }));
    }
    function getResolution() {
        const reslist = [
            "832x1216", "1216x832", "832x832",
            "1024x1536", "1536x1024", "1472x1472",
            "1088x1920", "1920x1088",
            "512x768", "768x512", "640x640"
        ];
        let res = config.width + "x" + config.height;
        
        if(!reslist.includes(res)) return "custom";
        return res;
    }

    function getSeed() {
        if(config.seed === -1) return "";
        return config.seed;
    }

    return (
        <div>
            <ModuleTitle label="Options" />

            <ModuleBody>
                <div>
                    <Label htmlFor="resolution">Image Size</Label>
                    <div className="flex items-center justify-between">
                        <Dropdown configKey="resolution" value={getResolution()} onValueChange={setResolution}
                        items={[
                            { value: "", label: "NORMAL" },
                            { value: "832x1216", label: "Portrait (832x1216)" },
                            { value: "1216x832", label: "Landscape (1216x832)" },
                            { value: "832x832", label: "Square (1024x1024)" },

                            { value: "", label: "LARGE" },
                            { value: "1024x1536", label: "Portrait (1024x1536)" },
                            { value: "1536x1024", label: "Landscape (1536x1024)" },
                            { value: "1472x1472", label: "Square (1472x1472)" },

                            { value: "", label: "WALLPAPER" },
                            { value: "1088x1920", label: "Portrait (1088x1920)" },
                            { value: "1920x1088", label: "Landscape (1920x1088)" },

                            { value: "", label: "SMALL" },
                            { value: "512x768", label: "Portrait (512x768)" },
                            { value: "768x512", label: "Landscape (768x512)" },
                            { value: "640x640", label: "Square (640x640)" },

                            { value: "", label: "CUSTOM" },
                            { value: "custom", label: "Custom" } 
                        ]} />
                        
                        <div className="flex items-center">
                            <Input className="w-[65px] text-center" type="number"
                                value={config.width}
                                onChange={(e) => {dispatch(configSlice.setValue({key: "width", value: e.target.valueAsNumber }))}}
                                step="64"
                                onBlur={() => dispatch(configSlice.setValue({key: "width", value: Math.max(64, Math.round(config.width / 64.0) * 64) }))}
                            ></Input>
                            <span className="x p-0.5 w-5 select-none hover:cursor-pointer"
                                onClick={(e) => {
                                    dispatch(configSlice.setValue({key: "width", value: config.height }));
                                    dispatch(configSlice.setValue({key: "height", value: config.width }));
                                }}
                            ></span>
                            <Input className="w-[65px] text-center" type="number"
                                value={config.height}
                                onChange={(e) => dispatch(configSlice.setValue({key: "height", value: e.target.valueAsNumber }))}
                            ></Input>
                        </div>
                    </div>
                </div>

                <Slider label="Steps: " configKey="steps" min={1} max={50} step={1} />
                <Slider label="Prompt Guidance: " configKey="prompt_guidance" min={0} max={10} step={0.1} />
                <Slider label="Prompt Guidance Rescale: " configKey="prompt_guidance_rescale" min={0} max={1} step={0.01} />

                <div className="flex items-start justify-between">
                    <div className="w-36">
                        <Label htmlFor="seed">Seed</Label>
                        <Input id="seed" type="number" placeholder="Random"
                            value={getSeed()}
                            onChange={(e) => dispatch(configSlice.setValue({ key: "seed", value: e.target.value == "" ? -1 : e.target.valueAsNumber }))}
                            onBlur={(e) => dispatch(configSlice.setValue({ key: "seed", value: e.target.value == "" ? -1 : Math.floor(e.target.valueAsNumber) }))}
                        ></Input>
                    </div>
                    <div>
                        <Dropdown configKey="sampler" label="Sampler" items={[
                            { value: "", label: "RECOMMENDED" },
                            { value: "k_euler", label: "Euler" },
                            { value: "k_euler_ancestral", label: "Euler Ancestral" },
                            { value: "k_dpmpp_2s_ancestral", label: "DPM++ 2S Ancestral" },
                            { value: "k_dpmpp_2m_sde", label: "DPM++ 2M SDE" },
                            { value: "", label: "OTHER" },
                            { value: "k_dpmpp_2m", label: "DPM++ 2M" },
                            { value: "k_dpmpp_sde", label: "DPM++ SDE" },
                            { value: "ddim_v3", label: "DDIM" }
                        ]} />
                        <CheckboxGroup>
                            <Checkbox configKey="SMEA" label="SMEA" uncheckTogether="DYN" />
                            <Checkbox configKey="DYN" label="DYN" disabled={!config.SMEA} />
                        </CheckboxGroup>
                    </div>
                </div>
            </ModuleBody>
        </div>
    );
}