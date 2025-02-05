import Slider from '@/components/elements/Slider';
import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';
import CheckboxGroup from '@/components/elements/CheckboxGroup';
import Checkbox from '@/components/elements/Checkbox';
import Dropdown from '@/components/elements/Dropdown';


export default function TEMPLATE() {
    return (
        <>
            <ModuleTitle label="TEMPLATE" />

            <ModuleBody>
                <Dropdown label="Test: " configKey="test" items={[
                    { value: '', label: 'Select an option' },
                    { value: '1', label: 'Test 1' },
                    { value: '2', label: 'Test 2' },
                    { value: '3', label: 'Test 3' },
                    { value: '4', label: 'Test 4' },
                    { value: '5', label: 'Test 5' },
                ]} />

                <Slider label="Test: " configKey="test" min={1} max={50} step={1} />

                <CheckboxGroup>
                    <Checkbox configKey="a" label="TESTA" />
                    <Checkbox configKey="b" label="TESTB" />
                </CheckboxGroup>
            </ModuleBody>
        </>
    )
};