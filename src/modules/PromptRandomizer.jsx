import Textarea from "@/components/elements/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Icon from "@/components/ui/icon";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

export default function PromptRandomizer() {
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();

    function getToggleValue(keys) {
        let values = [];
        for (let key of keys) {
            if (config[key]) {
                values.push(key);
            }
        }
        return values;
    }

    return (
        <>
            <h1 className="text-2xl text-primary font-bold mb-5">Prompt Randomizer</h1>

            <div className="flex flex-col space-y-4">
                <Textarea configKey="prompt_beg" title="Begining Prompt" placeholder="Tags to put at the beginning" autocomplete="on" height="20"/>
                <Textarea configKey="prompt_search" title="Search Tags" placeholder="Tags to search for the prompt randomization" autocomplete="on" height="28"/>
                
                <ToggleGroup type="multiple" className="justify-between"
                    onValueChange={(value) => dispatch(configSlice.setToggle({key: ["remove_artist", "remove_copyright", "remove_character"], value: value}))}
                    value={getToggleValue(["remove_artist", "remove_copyright", "remove_character"])}
                >
                    <ToggleGroupItem className="w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent hover:!border-ring duration-0 select-none" value="remove_artist" variant="outline"><div className="flex flex-col items-center gap-1"><Icon className="text-5xl" name="paint-brush-fill" x={true} sel={config.remove_artist}/>Remove<br/>Artist</div></ToggleGroupItem>
                    <ToggleGroupItem className="w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent hover:!border-ring duration-0 select-none" value="remove_copyright" variant="outline"><div className="flex flex-col items-center gap-1"><Icon className="text-5xl" name="book-4-fill" x={true} sel={config.remove_copyright}/>Remove<br/>Copyright</div></ToggleGroupItem>
                    <ToggleGroupItem className="w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent hover:!border-ring duration-0 select-none" value="remove_character" variant="outline"><div className="flex flex-col items-center gap-1"><Icon className="text-5xl" name="user-3-fill" x={true}  sel={config.remove_character}/>Remove<br/>Character</div></ToggleGroupItem>
                </ToggleGroup>
                
                <ToggleGroup type="multiple" className="justify-between"
                    onValueChange={(value) => dispatch(configSlice.setToggle({key: ["remove_characteristic", "remove_attire", "remove_nsfw"], value: value}))}
                    value={getToggleValue(["remove_characteristic", "remove_attire", "remove_nsfw"])}
                >
                    <ToggleGroupItem className="w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent hover:!border-ring duration-0 select-none" value="remove_characteristic" variant="outline"><div className="flex flex-col items-center gap-1"><Icon className="text-5xl" name="bear-fill" x={true} sel={config.remove_characteristic}/>Remove<br/>Characteristic</div></ToggleGroupItem>
                    <ToggleGroupItem className="w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent hover:!border-ring duration-0 select-none" value="remove_attire" variant="outline"><div className="flex flex-col items-center gap-1"><Icon className="text-5xl" name="hat-fill" x={true} sel={config.remove_attire}/>Remove<br/>Attire</div></ToggleGroupItem>
                    <ToggleGroupItem className="w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent hover:!border-ring duration-0 select-none" value="remove_nsfw" variant="outline"><div className="flex flex-col items-center gap-1"><Icon className="text-5xl" name="body-line" x={true} sel={config.remove_nsfw}/>Remove<br/>NSFW</div></ToggleGroupItem>
                </ToggleGroup>
                
                <ToggleGroup type="multiple" className="justify-between"
                    onValueChange={(value) => dispatch(configSlice.setToggle({key: ["remove_ornament"], value: value}))}
                    value={getToggleValue(["remove_ornament"])}
                >
                    <ToggleGroupItem className="w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent hover:!border-ring duration-0 select-none" value="remove_ornament" variant="outline"><div className="flex flex-col items-center gap-1"><Icon className="text-5xl" name="diamond_2_line" x={true} sel={config.remove_ornament}/>Remove<br/>Ornament</div></ToggleGroupItem>
                </ToggleGroup>

                <Textarea configKey="prompt_end" title="End Prompt" placeholder="Tags to put at the end" autocomplete="on" height="20"/>
                <Textarea configKey="negative" title="Negative Prompt" placeholder="Tags to exclude" autocomplete="on" height="28"/>
            </div>
        </>
    );
}