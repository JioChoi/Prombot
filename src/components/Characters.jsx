import { useEffect, useState, useRef, useMemo, createRef } from "react";
import { datasets } from "@/lib/NAI";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import Icon from "@/components/ui/icon";

export default function Characters() {
    const [copyright, dispatchCopyright] = useState(-1);
    const [search, dispatchSearch] = useState("");
    const [elements, dispatchElements] = useState([]);
    const [scrollHeight, dispatchScrollHeight] = useState(0);

    const faceFocus = useRef(true);

    const [elementsHeight, dispatchElementsHeight] = useState(0);

    const prvScrollY = useRef(0);
    const prvSearch = useRef("");

    const scroll = useRef(null);

    const buffer = 100;

    function updateElementsHeight() {
        let width = window.innerWidth - 10;
        let col = 2;
        if (width > 1024) {
            col = 4;
        }

        let size = (Math.min(1200, width) - 16 * (col + 1)) / col;
        dispatchElementsHeight((size + 16) * (Math.ceil(elements.length / col))); 
    }
    function updateScrollHeight() {
        let width = window.innerWidth - 10;
        let col = 2;
        if (width > 1024) {
            col = 4;
        }

        let size = (Math.min(1200, width) - 16 * (col + 1)) / col;

        dispatchScrollHeight((size + 16) * (Math.ceil(data.length / col)));
    }
    function updateToScroll(clear = false) {
        let y = scroll.current.scrollTop;

        let width = window.innerWidth - 10;
        let col = 2;
        if (width > 1024) {
            col = 4;
        }

        let size = (Math.min(1200, width) - 16 * (col + 1)) / col;
        
        let length = clear ? 0 : elements.length;
        let cnt = Math.floor(y / (size + 16)) * col + buffer - length;
        addItems(length, cnt, clear);
    }

    function addItems(start, end, clear = false) {
        if (start >= data.length) {
            if (clear) {
                dispatchElements([]);
            }
            return;
        }
        let bf = Math.min(end, data.length - start);

        if (bf <= 0) {
            return;
        }

        let imgStyle = "object-contain"
        if (faceFocus.current) {
            imgStyle = "object-cover object-top";
        }

        let temp = [...Array(bf).keys()].map((i) => {
            let temp = data[start + i];
            if (temp == undefined) {
                return;
            }
            let folder = Math.floor(temp.img / 10000);

            return (
                <div key={i} className={`relative rounded-lg aspect-square bg-zinc-800 overflow-hidden hover:cursor-pointer hover:brightness-90
                `}
                    onClick={() => {
                        if (temp.type == "copyright") {
                            prvScrollY.current = scroll.current.scrollTop;
                            dispatchCopyright(temp.id);
                        }
                        else {
                            // Save to clipboard
                            navigator.clipboard.writeText(temp.name);
                        }
                    }}
                >
                    {
                        temp.type == "character" ?
                        <div className="absolute top-1 left-1 w-[28px] h-[28px] bg-black flex align-middle justify-center rounded-full"><Icon name="user-3-fill" className="text-lg text-white"/></div> : ""
                    }
                    <img className={"w-full h-full pointer-events-none " + imgStyle} loading="lazy"
                        src={`https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characters/${folder}/${temp.img}.webp`}
                    >
                    </img>
                    <div
                        className={`absolute w-full min-h-2 bg-zinc-950 text-sm text-center align-middle bg-opacity-80 px-4 py-1
                            bottom-0
                        `}
                    >
                        {temp.name}
                    </div>
                </div>
            )
        });

        if (!clear) {
            temp = [...elements, ...temp];
        }

        dispatchElements(temp);
    }
    useEffect(() => {
        updateElementsHeight();
    }, [elements]);

    useEffect(() => {
        window.addEventListener("resize", () => {
            updateScrollHeight();
        });
    }, []);

    const data = useMemo(() => {
        if (copyright == -1) {
            let lowSearch = search.toLowerCase().trim();
            let arrSearch = lowSearch.split(',').map((temp) => temp.trim()).filter((temp) => temp != "");

            let result = datasets.characters_copyright.map((temp, index) => {
                return {
                    "name": temp[0],
                    "img": datasets.characters_characters[temp[2][0]].id,
                    "id": index,
                    "type": "copyright"
                }
            }).filter((temp) => temp.name.toLowerCase().includes(lowSearch));

            if (lowSearch != "") {
                result = result.concat(datasets.characters_characters.map((temp, index) => {
                    return {
                        "name": temp.name,
                        "img": temp.id,
                        "id": index,
                        "tags": temp.tags,
                        "type": "character"
                    }
                }).filter((temp) => {
                    let name = temp.name.toLowerCase().split(' (')[0];

                    if (name.includes(lowSearch)) {
                        return true;
                    }
                    
                    if (arrSearch.every((search) => temp.tags.some((tag) => tag[0].substring(0, search.length) == search))) {
                        return true;
                    }

                    return false;
                }));
            }
            
            return result;
        }
        else {
            let temp = datasets.characters_copyright[copyright][2];
            return temp.filter((temp) => datasets.characters_characters[temp] != undefined).map((temp, index) => {
                return {
                    "name": datasets.characters_characters[temp].name,
                    "img": datasets.characters_characters[temp].id,
                    "type": "character"
                }
            });
        }
    }, [copyright, search]);

    useEffect(() => {
        updateToScroll(true);
        updateScrollHeight();

        if (copyright != -1) {
            scroll.current.scrollTop = 0;
        }
        else {
            const interval = setInterval(() => {
                scroll.current.scrollTop = prvScrollY.current;
                if (scroll.current.scrollTop == prvScrollY.current) {
                    prvScrollY.current = 0;
                    clearInterval(interval);
                }
            }, 10);
        }
    }, [data]);
    
    return (
        <>
            <form onSubmit={(e) => {
                e.preventDefault();
                e.target[0].blur();
            }}>
                <div className="fixed w-full h-20 z-40 top-[32px] left-0 bg-zinc-800">
                <div className="h-12 flex items-center hover:cursor-pointer hover:brightness-90 bg-zinc-800"
                    onClick={() => {
                        if (copyright != -1) {
                            dispatchCopyright(-1);
                        }
                    }}
                    onFocus={(e) => {
                        e.target.select();
                    }}
                >
                    {
                    copyright != -1 ?
                    <Icon name="left-line" className="text-3xl px-3"/> :
                    <input
                        className="outline-none w-full h-full bg-zinc-800 text-white px-4 text-md"
                        placeholder="Search for the copyright, character, or tags"
                        onChange={(e) => {
                            dispatchSearch(e.target.value);
                            scroll.current.scrollTop = 0; 
                        }}
                        value={search}
                    ></input>
                    }
                </div>
                <div className="mt-2 ml-4">
                    <div className="flex items-center space-x-1">
                        <Checkbox id="faceFocus" 
                            checked={ faceFocus.current }
                            onCheckedChange={(checked) => {
                                faceFocus.current = checked;
                                updateToScroll(true);
                            }}
                        />
                        <Label htmlFor="faceFocus" className="m-0 hover:cursor-pointer">Focus on Face</Label>
                    </div>
                </div>
                    

                </div>
            </form>

            <div ref={scroll} className="h-[calc(100%-80px-32px)] w-full overflow-y-scroll mt-[80px]"
                onScroll={(e) => {
                    if (elementsHeight - 100 < e.target.scrollTop + e.target.clientHeight) {
                        updateToScroll();
                    }
                }}
            >
                <div
                    className={`grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 max-w-[1200px] mx-auto content-start`}
                    style={{height: (scrollHeight + 'px')}}
                >
                    {elements}
                </div>
            </div>
        </>
    )
}