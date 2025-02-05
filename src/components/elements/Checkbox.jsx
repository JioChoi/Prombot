import { Checkbox as _Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';

export default function Checkbox({configKey, label, disabled=false, uncheckTogether=""}) {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
    <div className="flex items-center space-x-1.5">
        <_Checkbox id={configKey}
            checked={config[configKey]}
            onCheckedChange={(checked) => {
                dispatch(configSlice.setValue({ key: configKey, value: checked }));
                if (uncheckTogether && !checked) {
                    dispatch(configSlice.setValue({ key: uncheckTogether, value: false }));
                }
            }}
            disabled={disabled}
        />
        <Label htmlFor={configKey} className="m-0 hover:cursor-pointer">{label}</Label>
    </div>
    )
}