import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Slider from '@/components/Slider';


export default function Dev() {
    return (
        <>
            <h1 className="text-2xl text-primary font-bold mb-5 mt-6">Developer Features</h1>

            <div className="flex flex-col space-y-4">
                <Slider label="Test: " keyname="test" min={1} max={50} step={1} />

                <div className="flex items-center space-x-1">
                    <Checkbox id="testa" 
                        checked={ true }
                        onCheckedChange={(checked) => {

                        }}
                    />
                    <Label htmlFor="testa" className="m-0">Test</Label>
                </div>
            </div>
        </>
    )
};