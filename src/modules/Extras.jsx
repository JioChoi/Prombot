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
                <div className="flex items-center space-x-7">
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
                <div className="flex items-center space-x-7">
                    <div className="flex items-center space-x-1">
                        <Checkbox id="strengthen_characteristic" 
                            checked={ config.strengthen_characteristic }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'strengthen_characteristic', value: checked }));
                            }}
                        />
                        <Label htmlFor="strengthen_characteristic" className="m-0">Strengthen Characteristic</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Checkbox id="auto_copyright" 
                            checked={ config.auto_copyright }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'auto_copyright', value: checked }));
                            }}
                        />
                        <Label htmlFor="auto_copyright" className="m-0">Auto Copyright</Label>
                    </div>
                </div>
                <div className="flex items-center space-x-7">
                    <div className="flex items-center space-x-1">
                        <Checkbox id="strengthen_attire" 
                            checked={ config.strengthen_attire }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'strengthen_attire', value: checked }));
                            }}
                        />
                        <Label htmlFor="strengthen_attire" className="m-0">Strengthen Attire</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Checkbox id="strengthen_ornament" 
                            checked={ config.strengthen_ornament }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'strengthen_ornament', value: checked }));
                            }}
                        />
                        <Label htmlFor="strengthen_ornament" className="m-0">Strengthen Ornament</Label>
                    </div>
                </div>
            </div>
        </>
    )
};