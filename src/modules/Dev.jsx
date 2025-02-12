import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';

import Dropdown from '@/components/elements/Dropdown';
import Slider from '@/components/elements/Slider';
import { Button } from '@/components/ui/button';

import { useDispatch, useSelector } from 'react-redux';
import * as dataSlice from '@/slices/dataSlice';

import { createBlob } from '@/lib/utils';

export default function Dev() {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    return (
        <div>
            <ModuleTitle label="Development Feautres" />

            <ModuleBody>
                <h2 className="text-lg font-semibold p-0 pt-5">Testing</h2>
                <Slider label="Character Strength: " configKey="DEV_CHARACTER_STRENGTH" min={0} max={1} step={0.01} />

                <Button variant="outline" className="bg-transparent" onClick={async () => {
                    let url = await createBlob();
                    dispatch(dataSlice.setValue({ key: "result_image", value: url }));
                    dispatch(dataSlice.setValue({ key: "current_image", value: url }));
                }}>Placeholder Result Image</Button>

                <h2 className="text-lg font-semibold p-0 pt-5">Config</h2>
                <Dropdown label="Model " configKey="DEV_MODEL" items={[
                    { value: 'nai-diffusion-3', label: 'NAI Diffusion V3' },
                    { value: 'nai-diffusion-4-curated-preview', label: 'NAI Diffusion V4 Preview' },
                ]} />
                
                <Button variant="outline" className="bg-transparent" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(localStorage.getItem('data')));
                    alert('Config copied to clipboard!');
                }}>Copy Config</Button>

                <Button variant="outline" className="bg-transparent" onClick={() => {
                    let config = prompt('Paste your config here:');
                    localStorage.setItem('data', JSON.parse(config));
                    window.location.reload();
                }}>Load Config</Button>

            </ModuleBody>
        </div>
    )
};