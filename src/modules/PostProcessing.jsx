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

    useEffect(() => {
        (async () => {
            let url = await applyPostProcessing(data.result_image, config, false);
            dispatch(dataSlice.setValue({ key: "current_image", value: url }));
            edited.current = url;
        })();
    }, [config.brightness, config.exposure, config.contrast, config.saturation, config.temperature, config.tint, config.shadows, config.highlights]);

    return (
        <div>
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
            >Original</Button>

            <ModuleBody>
                <Slider label="Brightness: " configKey="brightness" min={-100} max={100} step={1} reset={true} changeOnDrag={true} />
                <Slider label="Exposure: " configKey="exposure" min={-100} max={100} step={1} reset={true} changeOnDrag={false} />
                <Slider label="Contrast: " configKey="contrast" min={-100} max={100} step={1} reset={true} changeOnDrag={false} />
                <Slider label="Saturation: " configKey="saturation" min={-100} max={100} step={1} reset={true} changeOnDrag={false} />
                <Slider label="Temperature: " configKey="temperature" min={-100} max={100} step={1} reset={true} changeOnDrag={false} />
                <Slider label="Tint: " configKey="tint" min={-100} max={100} step={1} reset={true} changeOnDrag={false} />
                <Slider label="Shadows: " configKey="shadows" min={-100} max={100} step={1} reset={true} changeOnDrag={false} />
                <Slider label="Highlights: " configKey="highlights" min={-100} max={100} step={1} reset={true} changeOnDrag={false} />
            </ModuleBody>
        </div>
    )
};