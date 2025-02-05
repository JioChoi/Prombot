import { Label } from '@/components/ui/label';
import Slider from '@/components/elements/Slider';
import ModuleTitle from '@/components/elements/ModuleTitle';

import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';

import CheckboxGroup from '@/components/elements/CheckboxGroup';
import Checkbox from '@/components/elements/Checkbox';
import ModuleBody from '@/components/elements/ModuleBody';

export default function Automation() {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

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