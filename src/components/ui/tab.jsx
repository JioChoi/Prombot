import { Label } from './label';

export default function Tab({title, selected, color, onClick}) {
    return (
        <div onClick={onClick}
        className={`flex items-center justify-center h-full px-4 w-min hover:cursor-pointer ${selected ? `lg:bg-${color} bg-zinc-900` : "bg-zinc-950 text-zinc-400"}`}>
            <Label className="m-0 pointer-events-none select-none">{title}</Label>
        </div>
    )
};