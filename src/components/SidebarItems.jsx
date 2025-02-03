import PromptRandomizer from '../modules/PromptRandomizer';
import Options from '../modules/Options';
import Automation from '../modules/Automation';
import TEMPLATE from '@/modules/00-TEMPLATE';
import Extras from '@/modules/Extras';

function SidebarItems(data) {
    return (
        <div className="m-6">
            <PromptRandomizer />
            <Options />
            <Automation />
            <Extras />
        </div>
    );
}

export default SidebarItems;