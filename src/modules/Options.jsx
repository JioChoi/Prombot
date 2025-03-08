import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

import { Label } from "@/components/ui/label";

import Input from "@/components/elements/Input";
import CheckboxGroup from "@/components/elements/CheckboxGroup";
import Dropdown from "@/components/elements/Dropdown";
import Checkbox from "@/components/elements/Checkbox"
import Slider from '@/components/elements/Slider';


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
            "832x1216", "1216x832", "1024x1024",
            "1024x1536", "1536x1024", "1472x1472",
            "1088x1920", "1920x1088",
            "512x768", "768x512", "640x640"
        ];
        let res = config.width + "x" + config.height;
        
        if(!reslist.includes(res)) return "custom";
        return res;
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
                            { value: "1024x1024", label: "Square (1024x1024)" },

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
                            <Input width="60px" configKey="width" type="number" step="64" center="true"/>

                            <span className="x p-0.5 w-5 select-none hover:cursor-pointer"
                                onClick={(e) => {
                                    dispatch(configSlice.setValue({key: "width", value: config.height }));
                                    dispatch(configSlice.setValue({key: "height", value: config.width }));
                                }}
                            ></span>

                            <Input width="60px" configKey="height" type="number" step="64" center="true"/>
                        </div>
                    </div>
                </div>

                <Slider label="Steps: " configKey="steps" min={1} max={50} step={1} />
                <Slider label="Prompt Guidance: " configKey="prompt_guidance" min={0} max={10} step={0.1} />
                <Slider label="Prompt Guidance Rescale: " configKey="prompt_guidance_rescale" min={0} max={1} step={0.01} />

                <div className="flex items-start justify-between">
                    <Input label="Seed" configKey="seed" width="126px" type="number" placeholder="Random"
                        value={config.seed == -1 ? "" : config.seed}
                        onChange={(e) => dispatch(configSlice.setValue({ key: "seed", value: e.target.value == "" ? -1 : Math.max(e.target.valueAsNumber, -1) }))}
                        onBlur={(e) => dispatch(configSlice.setValue({ key: "seed", value: e.target.value == "" ? -1 : Math.max(Math.floor(e.target.valueAsNumber), -1) }))}
                    />
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