import Slider from '@/components/elements/Slider';
import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';
import CheckboxGroup from '@/components/elements/CheckboxGroup';
import Checkbox from '@/components/elements/Checkbox';
import Dropdown from '@/components/elements/Dropdown';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useRef } from 'react';
import * as dataSlice from '@/slices/dataSlice';

import { applyPostProcessing } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { setHistoryItem } from '@/lib/utils';

export default function PostProcessing() {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);
    const data = useSelector((state) => state.data);
    const edited = useRef("");

    async function applyEffect(fast) {
        let result = await applyPostProcessing(data.result_image, config);
        if (!result) return;

        dispatch(dataSlice.setValue({ key: "current_image", value: result }));
        setHistoryItem(dispatch, result, config, 0);
        edited.current = result;
    }

    useEffect(() => {
        applyEffect(false);
    }, [config.brightness, config.exposure, config.contrast, config.saturation, config.temperature, config.tint, config.shadows, config.highlights, config.sharpness]);

    return (
        <div>
            <div className="flex flex-row justify-between items-center">
                <ModuleTitle label="Post Processing" />
                <Button
                    onMouseDown={() => {
                        edited.current = data.current_image;
                        dispatch(dataSlice.setValue({ key: "current_image", value: data.result_image }));
                    }}
                    onTouchStart={() => {
                        edited.current = data.current_image;
                        dispatch(dataSlice.setValue({ key: "current_image", value: data.result_image }));
                        dispatch(dataSlice.setValue({ key: "changing_parameter", value: "Original" }));
                    }}

                    onMouseUp={() => {
                        dispatch(dataSlice.setValue({ key: "current_image", value: edited.current }));
                    }}
                    onTouchEnd={() => {
                        dispatch(dataSlice.setValue({ key: "current_image", value: edited.current }));
                        dispatch(dataSlice.setValue({ key: "changing_parameter", value: "" }));
                    }}
                    variant="outline" className="w-20 h-8 mt-[24px] bg-transparent select-none"
                >Original</Button>
            </div>
            

            <ModuleBody>
                <Slider label="Brightness: " configKey="brightness" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true}/>
                <Slider label="Exposure: " configKey="exposure" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
                <Slider label="Contrast: " configKey="contrast" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
                <Slider label="Saturation: " configKey="saturation" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
                <Slider label="Temperature: " configKey="temperature" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
                <Slider label="Tint: " configKey="tint" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
                <Slider label="Shadows: " configKey="shadows" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
                <Slider label="Highlights: " configKey="highlights" min={-30} max={30} step={0.5} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
                <Slider label="Sharpness: " configKey="sharpness" min={-5} max={5} step={0.01} reset={true} changeOnDrag={true} showResultWhileChanging={true} />
            </ModuleBody>
        </div>
    )
};