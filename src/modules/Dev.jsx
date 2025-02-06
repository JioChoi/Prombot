import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';

import Dropdown from '@/components/elements/Dropdown';
import Slider from '@/components/elements/Slider';


export default function Dev() {
    return (
        <div>
            <ModuleTitle label="Development Feautres" />

            <ModuleBody>
                <Dropdown label="Model " configKey="DEV_MODEL" items={[
                    { value: 'nai-diffusion-3', label: 'NAI Diffusion V3' },
                    { value: 'nai-diffusion-4-curated-preview', label: 'NAI Diffusion V4 Preview' },
                ]} />

                <Slider label="Character Strength: " configKey="DEV_CHARACTER_STRENGTH" min={0} max={1} step={0.01} />
            </ModuleBody>
        </div>
    )
};