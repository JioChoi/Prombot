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

export default function PostProcessing() {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);
    const data = useSelector((state) => state.data);
    const edited = useRef("");

    const abortController = useRef(new AbortController());

    async function applyEffect(fast) {
        {
            abortController.current.abort();
            abortController.current = new AbortController();

            try {
                dispatch(dataSlice.setValue({ key: "pixelated", value: true }));

                let url = await applyPostProcessing(data.result_image, config, fast, abortController.current, (url) => {
                    dispatch(dataSlice.setValue({ key: "current_image", value: url }));
                });

                dispatch(dataSlice.setValue({ key: "pixelated", value: false }));
                edited.current = url;
            } catch(e) {
                return;
            }
        }
    }

    useEffect(() => {
        applyEffect(true);
    }, [config.brightness, config.exposure, config.contrast, config.saturation, config.temperature, config.tint, config.shadows, config.highlights]);

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
                    }}

                    onMouseUp={() => {
                        dispatch(dataSlice.setValue({ key: "current_image", value: edited.current }));
                    }}
                    onTouchEnd={() => {
                        dispatch(dataSlice.setValue({ key: "current_image", value: edited.current }));
                    }}
                    variant="outline" className="w-20 h-8 mt-[24px] bg-transparent"
                >Original</Button>
            </div>
            

            <ModuleBody>
                <Slider onValueCommit={() => {applyEffect(false)}} label="Brightness: " configKey="brightness" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
                <Slider onValueCommit={() => {applyEffect(false)}} label="Exposure: " configKey="exposure" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
                <Slider onValueCommit={() => {applyEffect(false)}} label="Contrast: " configKey="contrast" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
                <Slider onValueCommit={() => {applyEffect(false)}} label="Saturation: " configKey="saturation" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
                <Slider onValueCommit={() => {applyEffect(false)}} label="Temperature: " configKey="temperature" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
                <Slider onValueCommit={() => {applyEffect(false)}} label="Tint: " configKey="tint" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
                <Slider onValueCommit={() => {applyEffect(false)}} label="Shadows: " configKey="shadows" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
                <Slider onValueCommit={() => {applyEffect(false)}} label="Highlights: " configKey="highlights" min={-30} max={30} step={0.01} reset={true} changeOnDrag={true} />
            </ModuleBody>
        </div>
    )
};