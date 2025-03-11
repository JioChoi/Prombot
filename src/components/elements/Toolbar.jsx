import Icon from '@/components/ui/icon';
import { getDateString } from '@/lib/utils';


export default function Toolbar({imageUrl}) {
    return (
        <div className="flex flex-row space-x-2 justify-center">
            <div className="mt-2 w-9 h-9 flex justify-center items-center bg-zinc-800 rounded-md shadow-lg text-white
                lg:hover:brightness-75 lg:hover:cursor-pointer"
                onClick={() => {
                    let a = document.createElement("a");
                    a.href = imageUrl;
                    a.download = getDateString() + ".png";
                    a.click();
                }}fff
            >
                <Icon name="download_2_line" className="text-xl" />
            </div>

            <div className="mt-2 w-9 h-9 flex justify-center items-center bg-zinc-800 bg-opacity-70 text-white rounded-md shadow-lg
                lg:hover:brightness-75 lg:hover:cursor-pointer"
                onClick={async () => {
                    let blob = await fetch(imageUrl).then(r => r.blob());
                    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                }}
            >
                <Icon name="copy_line" className="text-xl" />
            </div>

            <div className="mt-2 px-3 h-9 flex justify-center items-center bg-zinc-800 bg-opacity-70 text-white rounded-md shadow-lg
                lg:hover:brightness-75 lg:hover:cursor-pointer"
                onClick={async () => {
                    alert("Not implemented yet! :D");
                }}
            >
                Send to i2i
            </div>
        </div>
    )
}