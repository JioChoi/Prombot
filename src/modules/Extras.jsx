import Checkbox from '@/components/elements/Checkbox';
import { Label } from '@/components/ui/label';
import Slider from '@/components/elements/Slider';
import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';
import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';
import CheckboxGroup from '@/components/elements/CheckboxGroup';


export default function Extras() {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
        <>
            <ModuleTitle label="Extras" />

            <ModuleBody>
                <CheckboxGroup>
                    <Checkbox configKey="reorder" label="Reorder tags" />
                    <Checkbox configKey="naistandard" label="Reformat to NAI standard" />
                </CheckboxGroup>
                <CheckboxGroup>
                    <Checkbox configKey="strengthen_characteristic" label="Strengthen Characteristic" />
                    <Checkbox configKey="auto_copyright" label="Auto Copyright" />
                </CheckboxGroup>
                <CheckboxGroup>
                    <Checkbox configKey="strengthen_attire" label="Strengthen Attire" />
                    <Checkbox configKey="strengthen_ornament" label="Strengthen Ornament" />
                </CheckboxGroup>
            </ModuleBody>
        </>
    )
};