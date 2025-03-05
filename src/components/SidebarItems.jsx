import PromptRandomizer from '../modules/PromptRandomizer';
import Options from '../modules/Options';
import Automation from '../modules/Automation';
import Extras from '@/modules/Extras';
import Dev from '@/modules/Dev';
import PostProcessing from '@/modules/PostProcessing';
import CharacterPrompts from '@/modules/CharacterPrompts';

function SidebarItems(data) {
    return (
        <div className="m-4 lg:m-5 space-y-14" id="sidebar-items">
            <PromptRandomizer />
            <CharacterPrompts />
            <Options />
            <Automation />
            <PostProcessing />
            <Extras />
            <Dev />
        </div>
    );
}

export default SidebarItems;