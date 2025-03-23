import Tab from "@/components/ui/tab"

export default function Tabs({tab, setTab, singlePage=false}) {
    return (
        <div className="w-full h-8 bg-neutral-950 z-40 relative flex flex-row">
            <Tab title="Generate" selected={tab == 0} brighter={true} onClick={() => { singlePage ? window.location.href = "/" : setTab(0)}}/>
            <Tab title="History" selected={tab == 1} brighter={false} onClick={() => { singlePage ? window.location.href = "/?tab=1" : setTab(1)}}/>
            <Tab title="Characters" selected={tab == 2} brighter={true} onClick={() => { tab == 2 ? null : window.location.href = "/characters";}}/>
            <Tab title="Exif" selected={tab == 3} brighter={true} onClick={() => { tab == 3 ? null : window.location.href = "/exif";}}/>
        </div>
    );
}