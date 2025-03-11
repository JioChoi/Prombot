import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';

import Checkbox from '@/components/elements/Checkbox';
import CheckboxGroup from '@/components/elements/CheckboxGroup';

import Toggles from '@/components/elements/Toggles';

export default function Extras() {
    return (
        <div>
            <ModuleTitle label="Extras" />

            <ModuleBody>
                <h2 className="text-lg font-semibold p-0 pt-4">Strengthen Tags</h2>
                <div>
                    <Toggles items={[
                        { key: "strengthen_characteristic", icon: "bear_fill", x: false, label: "Strengthen\nCharacteristics" },
                        { key: "strengthen_attire", icon: "hat-fill", x: false, label: "Strengthen\nAttires" },
                        { key: "strengthen_ornament", icon: "diamond_2_line", x: false, label: "Strengthen\nOrnaments" },
                    ]}/>
                </div>
            
                <h2 className="text-lg font-semibold p-0 pt-4">Extra Options</h2>
                <CheckboxGroup>
                    <Checkbox configKey="reorder" label="Reorder tags" />
                    <Checkbox configKey="naistandard" label="Reformat to NAI standard" />
                </CheckboxGroup>
                <CheckboxGroup>
                    <Checkbox configKey="auto_copyright" label="Auto Copyright" />
                    <Checkbox configKey="ignore_errors" label="Ignore Errors" />
                </CheckboxGroup>
                <CheckboxGroup>
                    <Checkbox configKey="legacy_uc" label="Legacy Prompt Conditioning" />
                    <Checkbox configKey="imfeelinglucky" label="I'm feeling lucky!" />
                </CheckboxGroup>
            </ModuleBody>
        </div>
    )
};