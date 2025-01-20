import PromptRandomizer from '../modules/PromptRandomizer';
import Options from '../modules/Options';

function SidebarItems(data) {
    return (
        <div className="m-6">
            <PromptRandomizer />
            <Options />
        </div>
    );
}

export default SidebarItems;