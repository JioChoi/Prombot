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


export default function CharacterPrompts() {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
        <div>
            <ModuleTitle label="Character Prompts" />

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