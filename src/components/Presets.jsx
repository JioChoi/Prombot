import Icon from "./ui/icon"
import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from 'react-redux';
import * as configSlice from "@/slices/configSlice";
import * as dataSlice from "@/slices/dataSlice";
import * as NAI from "@/lib/NAI";
import axios from "axios";
import Drawer from "./elements/Drawer";

export default function Presets() {
    const data = useSelector((state) => state.data);
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();

    return (
        <>
            <Drawer id="presets" title="Presets"
                items={
                    [{name: "Default", data: "{}", deletable: false}, ...data.presets]
                }
                onClick={(item) => {
                    dispatch(configSlice.loadFromString(item.data));
                    dispatch(dataSlice.setValue({key: "hide_sidebar", value: false}));
                    return true;
                }}
                onDelete={(item) => {
                    let yes = confirm(`Are you sure you want to delete the preset "${item.name}"?`);
                    
                    if (yes) {
                        axios.post(NAI.host + "/deletePreset", {
                            id: item.id,
                            uid: data.uid,
                        }).then((res) => {
                            NAI.loadPresets(data.uid).then((presets) => {
                                dispatch(dataSlice.setValue({key: "presets", value: presets}));
                            });
                        });
                        return true;
                    }
                    return false;
                }}
                buttonLabel="Add Preset"
                onButtonClick={() => {
                    let name = prompt("Enter the name of the preset");
                    
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
                className="lg:left-[450px]"
                buttonClassName="lg:left-[450px]"
                icon="settings-2-line"
            />
        </>
    )
}