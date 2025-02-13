import PromptRandomizer from '../modules/PromptRandomizer';
import Options from '../modules/Options';
import Automation from '../modules/Automation';
import Extras from '@/modules/Extras';
import Dev from '@/modules/Dev';
import PostProcessing from '@/modules/PostProcessing';

function SidebarItems(data) {
    return (
        <div className="m-6 space-y-14" id="sidebar-items">
            <PromptRandomizer />
            <Options />
            <PostProcessing />
            <Automation />
            <Extras />
            <Dev />
        </div>
    );
}

export default SidebarItems;