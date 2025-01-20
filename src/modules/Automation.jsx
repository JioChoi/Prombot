import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Slider from '@/components/Slider';

import { useDispatch, useSelector } from 'react-redux';
import * as configSlice from '@/slices/configSlice';

export default function Automation() {
    const dispatch = useDispatch();
    const config = useSelector(state => state.config);

    return (
        <>
            <h1 className="text-2xl text-primary font-bold mb-5 mt-6">Automation</h1>

            <div className="flex flex-col space-y-4">
                <Slider label="Delay: " keyname="delay" min={1} max={30} step={1} unit="seconds" />

                <div className="flex items-center space-x-5">
                    <div className="flex items-center space-x-1">
                        <Checkbox id="enable_automation" 
                            checked={ config.enable_automation }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'enable_automation', value: checked }));
                            }}
                        />
                        <Label htmlFor="enable_automation" className="m-0">Enable Automation</Label>
                    </div>

                    <div className="flex items-center space-x-1">
                        <Checkbox id="automatically_download" 
                            checked={ config.automatically_download }
                            onCheckedChange={(checked) => {
                                dispatch(configSlice.setValue({ key: 'automatically_download', value: checked }));
                            }}
                        />
                        <Label htmlFor="automatically_download" className="m-0">Automatically Download</Label>
                    </div>
                </div>
            </div>
        </>
    )
};