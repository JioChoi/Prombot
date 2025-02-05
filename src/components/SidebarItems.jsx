import PromptRandomizer from '../modules/PromptRandomizer';
import Options from '../modules/Options';
import Automation from '../modules/Automation';
import Extras from '@/modules/Extras';
import Dev from '@/modules/Dev';

function SidebarItems(data) {
    return (
        <div className="m-6 space-y-6">
            <PromptRandomizer />
            <Options />
            <Automation />
            <Extras />
            <Dev />
        </div>
    );
}

export default SidebarItems;