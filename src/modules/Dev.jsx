import { Label } from '@/components/ui/label';
import Slider from '@/components/elements/Slider';
import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';
import CheckboxGroup from '@/components/elements/CheckboxGroup';
import Checkbox from '@/components/elements/Checkbox';


export default function Dev() {
    return (
        <>
            <ModuleTitle label="Developer Feautres" />

            <ModuleBody>
                <Slider label="Test: " configKey="test" min={1} max={50} step={1} />

                <CheckboxGroup>
                    <Checkbox configKey="a" label="TESTA" />
                    <Checkbox configKey="b" label="TESTB" />
                </CheckboxGroup>
            </ModuleBody>
        </>
    )
};