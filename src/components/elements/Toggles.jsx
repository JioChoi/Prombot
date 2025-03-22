import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Icon from "@/components/ui/icon";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

export default function Toggles({items, disableKey=""}) {
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
        {!(disableKey != "" && config[disableKey]) && <ToggleGroup type="multiple" className="justify-between"
            onValueChange={(value) => dispatch(configSlice.setToggle({key: items.map(item => item.key), value: value}))}
            value={getToggleValue(items.map(item => item.key))}
        >
            {items.map((item, i) => (
                <ToggleGroupItem
                    className={`w-[calc(33.33%-7px)] h-fit p-2 data-[state=on]:border-zinc-500 hover:bg-transparent lg:hover:!border-ring duration-0 select-none ${item.visible === false ? "opacity-0 pointer-events-none" : ""}`}
                    value={item.key} variant="outline" key={i}>
                        <div className="flex flex-col items-center gap-1">
                            <Icon className="text-5xl" name={item.icon} x={item.x} sel={config[item.key]}/>
                            <div className="text-center flex flex-col">
                                {item.label.split("\n").map((line, i) => (
                                    <span key={i} className="m-0 p-0">{line}</span>
                                ))}
                            </div>
                        </div>
                </ToggleGroupItem>
            ))}
        </ToggleGroup>}
        </>
    )
}