import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';

export default function Dropdown({label="", configKey, items, value=null, onValueChange=undefined}) {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
        <div>
            {label == "" ? null : <Label htmlFor={configKey}>{label}</Label>}
            <Select id={configKey}
                value={value ? value : config[configKey]}
                onValueChange={onValueChange ? onValueChange : (value) => dispatch(configSlice.setValue({ key: configKey, value: value }))}
            >
                <SelectTrigger className="w-48">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {items.map((item, i) => {
                            if (item.value == "") {
                                return <SelectLabel key={i} className={`text-xs text-zinc-400 ${i == 0 ? null : 'pt-5'}`}>{item.label}</SelectLabel>;
                            }
                            else {
                                return <SelectItem key={i} value={item.value} className="hover:cursor-pointer">{item.label}</SelectItem>;
                            }
                        })}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}