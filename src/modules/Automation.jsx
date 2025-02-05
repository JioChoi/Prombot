import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';

import Slider from '@/components/elements/Slider';
import CheckboxGroup from '@/components/elements/CheckboxGroup';
import Checkbox from '@/components/elements/Checkbox';

export default function Automation() {
    return (
        <div>
            <ModuleTitle label="Automation" />

            <ModuleBody>
                <Slider label="Delay: " configKey="delay" min={1} max={30} step={1} unit="seconds" />

                <CheckboxGroup>
                    <Checkbox configKey="enable_automation" label="Enable Automation" />
                    <Checkbox configKey="automatically_download" label="Automatically Download" />
                </CheckboxGroup>
            </ModuleBody>
        </div>
    )
};