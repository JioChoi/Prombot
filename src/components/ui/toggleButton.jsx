
import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';
import Icon from '@/components/ui/icon';

export default function ToggleButton({configKey, children, icon}) {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
        <div className={`px-2 py-[1px] rounded-sm text-md font-medium text-zinc-300 lg:hover:bg-zinc-700 select-none hover:cursor-pointer
            ${config[configKey] ? 'text-yellow-100' : 'text-zinc-300'}
            `}
            onClick={() => {
                dispatch(configSlice.setValue({key: configKey, value: !config[configKey]}));
            }
        }
        >
            {
                config[configKey] ?
                <Icon name="check_fill" className="text-sm pr-1" /> :
                <Icon name="close_fill" className="text-sm pr-1" />
            }
            {children}
        </div>
    );
}