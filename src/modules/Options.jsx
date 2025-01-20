import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"
import { useContext } from "react";

import Slider from '@/components/Slider';

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

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
        <>
            <h1 className="text-2xl text-primary font-bold mb-5 mt-6">Options</h1>

            <div className="flex flex-col space-y-4">
                <div>
                    <Label htmlFor="resolution">Image Size</Label>
                    <div className="flex items-center justify-between">
                        <Select id="resolution" 
                            value={getResolution()}
                            onValueChange={setResolution}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel className="text-xs text-zinc-400 pt-5">NORMAL</SelectLabel>
                                    <SelectItem value="832x1216">Portrait (832x1216)</SelectItem>
                                    <SelectItem value="1216x832">Landscape (1216x832)</SelectItem>
                                    <SelectItem value="832x832">Square (1024x1024)</SelectItem>

                                    <SelectLabel className="text-xs text-zinc-400 pt-5">LARGE</SelectLabel>
                                    <SelectItem value="1024x1536">Portrait (1024x1536)</SelectItem>
                                    <SelectItem value="1536x1024">Landscape (1536x1024)</SelectItem>
                                    <SelectItem value="1472x1472">Square (1472x1472)</SelectItem>

                                    <SelectLabel className="text-xs text-zinc-400 pt-5">WALLPAPER</SelectLabel>
                                    <SelectItem value="1088x1920">Portrait (1088x1920)</SelectItem>
                                    <SelectItem value="1920x1088">Landscape (1920x1088)</SelectItem>

                                    <SelectLabel className="text-xs text-zinc-400 pt-5">SMALL</SelectLabel>
                                    <SelectItem value="512x768">Portrait (512x768)</SelectItem>
                                    <SelectItem value="768x512">Landscape (768x512)</SelectItem>
                                    <SelectItem value="640x640">Square (640x640)</SelectItem>

                                    <SelectLabel className="text-xs text-zinc-400 pt-5">CUSTOM</SelectLabel>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        
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

                <Slider label="Steps: " keyname="steps" min={1} max={50} step={1} />
                <Slider label="Prompt Guidance: " keyname="prompt_guidance" min={0} max={10} step={0.1} />
                <Slider label="Prompt Guidance Rescale: " keyname="prompt_guidance_rescale" min={0} max={1} step={0.01} />

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
                        <Label htmlFor="sampler">Sampler</Label>
                        <Select id="sampler" value={config.sampler}
                            onValueChange={(value) => dispatch(configSlice.setValue({ key: "sampler", value: value }))}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel className="text-xs text-zinc-400 pt-5">RECOMMENDED</SelectLabel>
                                    <SelectItem value="k_euler">Euler</SelectItem>
                                    <SelectItem value="k_euler_ancestral">Euler Ancestral</SelectItem>
                                    <SelectItem value="k_dpmpp_2s_ancestral">DPM++ 2S Ancestral</SelectItem>
                                    <SelectItem value="k_dpmpp_2m_sde">DPM++ 2M SDE</SelectItem>

                                    <SelectLabel className="text-xs text-zinc-400 pt-5">OTHER</SelectLabel>
                                    <SelectItem value="k_dpmpp_2m">DPM++ 2M</SelectItem>
                                    <SelectItem value="k_dpmpp_sde">DPM++ SDE</SelectItem>
                                    <SelectItem value="ddim_v3">DDIM</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        
                        <div className="flex items-center align-middle space-x-3 mt-3">
                            <div className="flex items-center space-x-1">
                                <Checkbox id="SMEA" 
                                    checked={config.SMEA}
                                    onCheckedChange={(checked) => {
                                        dispatch(configSlice.setValue({ key: "SMEA", value: checked }))
                                        if(!checked) dispatch(configSlice.setValue({ key: "DYN", value: false }))
                                    }}
                                />
                                <Label htmlFor="SMEA" className="m-0">SMEA</Label>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                                <Checkbox id="DYN"
                                    checked={config.DYN}
                                    onCheckedChange={(checked) => dispatch(configSlice.setValue({ key: "DYN", value: checked }))}
                                    disabled={!config.SMEA}
                                />
                                <Label htmlFor="DYN" className="m-0">DYN</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}