import Slider from '@/components/elements/Slider';
import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';
import CheckboxGroup from '@/components/elements/CheckboxGroup';
import Checkbox from '@/components/elements/Checkbox';
import Dropdown from '@/components/elements/Dropdown';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';
import CharacterPrompt from '@/components/elements/CharacterPrompt';
import ToggleButton from '@/components/ui/toggleButton';


export default function CharacterPrompts() {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
        <div>
            <div className="flex justify-between items-center mb-2 mt-6">
                <h1 className="text-2xl text-primary font-bold module-title">Character Prompts</h1>
                <ToggleButton configKey="use_coords">AI's Choice</ToggleButton>
            </div>

            <ModuleBody>
                <div className="space-y-2">
                    {
                        config.character_prompts.map((prompt, index) => {
                            return <CharacterPrompt key={index} id={index} />
                        })
                    }
                </div>

                <Button variant="outline" className="bg-transparent" onClick={() => {
                    dispatch(configSlice.addCharacterPrompt({prompt: "", uc: "", x: 0.5, y: 0.5}));
                }}>Add Character</Button>
            </ModuleBody>
        </div>
    )
};