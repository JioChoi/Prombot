import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Slider from '@/components/Slider';
import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';


export default function Extras() {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
        <>
            <h1 className="text-2xl text-primary font-bold mb-5 mt-6">Extras</h1>

            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-5">
                    <div className="flex items-center space-x-1">
                        <Checkbox id="reorder" 
                            checked={ config.reorder }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'reorder', value: checked }));
                            }}
                        />
                        <Label htmlFor="reorder" className="m-0">Reorder tags</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Checkbox id="naistandard" 
                            checked={ config.naistandard }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'naistandard', value: checked }));
                            }}
                        />
                        <Label htmlFor="naistandard" className="m-0">Reformat to NAI standard</Label>
                    </div>
                </div>
                <div className="flex items-center space-x-5">
                    <div className="flex items-center space-x-1">
                        <Checkbox id="strengthen_characteristics" 
                            checked={ config.strengthen_characteristics }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'strengthen_characteristics', value: checked }));
                            }}
                        />
                        <Label htmlFor="strengthen_characteristics" className="m-0">Strengthen Characteristics</Label>
                    </div>
                </div>
            </div>
        </>
    )
};