import { useEffect, useState, useRef, useMemo } from "react";
import { datasets } from "@/lib/NAI";

import Icon from "@/components/ui/icon";

export default function Characters() {
    const [copyright, dispatchCopyright] = useState(-1);
    const [search, dispatchSearch] = useState("");
    const [scrollY, dispatchScrollY] = useState(0);

    const prvScrollY = useRef(-1);
    const prvSearch = useRef("");
    const fakeScroll = useRef(0);

    const width = useRef(window.innerWidth);
    const height = useRef(window.innerHeight);
    const col = useRef(2);
    const row = useRef(5);
    const size = useRef(60);
    const [scrollHeight, dispatchScrollHeight] = useState(0);

    const [posX, dispatchPosX] = useState(0);
    const [posY, dispatchPosY] = useState(0);

    const [hover, dispatchHover] = useState(-1);

    const folders = ["0", "10k", "20k"];

    width.current = window.innerWidth;
    height.current = window.innerHeight;

    const buffer = 2;

    const data = useMemo(() => {
        if (copyright == -1) {
            return datasets.characters_copyright.map((temp, index) => {
                return {
                    "name": temp[0],
                    "img": datasets.characters_characters[temp[2][0]].img,
                    "id": index
                }
            }).filter((temp) => temp.name.toLowerCase().includes(search.toLowerCase()));
        }
        else {
            let temp = datasets.characters_copyright[copyright][2];
            return temp.filter((temp) => datasets.characters_characters[temp] != undefined).map((temp, index) => {
                return {
                    "name": datasets.characters_characters[temp].name,
                    "img": datasets.characters_characters[temp].img
                }
            });
        }
    }, [copyright, search]);

    useEffect(() => {
        dispatchScrollHeight((size.current + 16) * (Math.ceil(data.length / col.current)));
    }, [data]);

    useEffect(() => {
        width.current = window.innerWidth;
        height.current = window.innerHeight - 80;
        if (width.current > 1024) {
            col.current = 4;
        }
        else {
            col.current = 2;
        }

        size.current = (Math.min(1200, width.current) - 16 * (col.current + 1)) / col.current;
        row.current = Math.ceil((height.current) / (size.current + 16));

        dispatchScrollHeight((size.current + 16) * (Math.ceil(data.length / col.current)));
        
        window.addEventListener("resize", () => {
            width.current = window.innerWidth;
            height.current = window.innerHeight - 80;
            if (width.current > 1024) {
                col.current = 4;
            }
            else {
                col.current = 2;
            }

            size.current = (Math.min(1200, width.current) - 16 * (col.current + 1)) / col.current;
            row.current = Math.ceil((height.current) / (size.current + 16));

            dispatchScrollHeight((size.current + 16) * (Math.ceil(data.length / col.current)));
        });

        window.addEventListener("mousemove", (e) => {
            dispatchPosX(e.clientX);
            dispatchPosY(e.clientY);
        });
    }, []);

    useEffect(() => {
        let margin = Math.max((width.current - 1200) / 2 + 16, 16);
            let offset = (80 + 16 - (scrollY % ((size.current + 16) * buffer)));

            if ((posX - margin) % (size.current + 16) < size.current && (posY - offset) % (size.current + 16) < size.current) {
                let x = Math.floor((posX - margin) / (size.current + 16));
                let y = Math.floor((posY - offset) / (size.current + 16));

                if (x >= 0 && x < col.current && y >= 0) {
                    let id = x + y * col.current;
                    if(id < data.length) {
                        document.body.style.cursor = "pointer";
                        dispatchHover(id);
                    }
                }
                else {
                    document.body.style.cursor = "default";
                    dispatchHover(-1);
                }
            }
            else {
                document.body.style.cursor = "default";
                dispatchHover(-1);
            }
    }, [posX, posY, scrollY]);

    const pos = Math.max(Math.floor((scrollY) / ((size.current + 16) * buffer)), 0);

    return (
        <>
            <form onSubmit={(e) => {
                e.preventDefault();
                e.target[0].blur();
            }}>
                <div className="fixed w-full h-12 z-40 bg-zinc-800 flex items-center hover:cursor-pointer hover:brightness-90"
                    onClick={() => {
                        if (copyright != -1) {
                            dispatchCopyright(-1);
                            dispatchSearch("");

                            setTimeout(() => {
                                fakeScroll.current.scrollTop = prvScrollY.current;
                                dispatchSearch(prvSearch.current);
                            }, 100);
                        }
                    }}
                >
                    {
                    copyright != -1 ?
                    <Icon name="left-line" className="text-3xl px-3"/> :
                    <input
                        className="outline-none w-full h-full bg-zinc-800 text-white px-4 text-lg"
                        placeholder="Search for the copyright"
                        onChange={(e) => {
                            dispatchSearch(e.target.value);
                        }}
                        value={search}
                    ></input>
                    }
                </div>
            </form>

            {/* Fake Scroll */}
            <div
                ref={fakeScroll}
                className="fixed w-full h-[calc(100%-80px)] overflow-y-auto bg-transparent z-40 top-[80px]"
                onScroll={(e) => {
                    dispatchScrollY(e.target.scrollTop);
                }}
                onClick={(e) => {
                    if(copyright == -1) {
                        if (hover != -1 && hover < data.length) {
                            let id = (pos * (buffer * col.current)) + hover;
                            prvScrollY.current = fakeScroll.current.scrollTop;
                            prvSearch.current = search;
                            fakeScroll.current.scrollTop = 0;
                            dispatchCopyright(data[id].id);
                            dispatchSearch("");
                        }
                    }
                    else {
                        if (hover != -1 && hover < data.length) {
                            let id = (pos * (buffer * col.current)) + hover;
                            navigator.clipboard.writeText(data[id].name);
                        }
                    }
                }}
            >
                <div id="scrollBlock" style={{height: (scrollHeight + 16) + "px"}}></div>
            </div>

            <div
                className={`grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 overflow-y-hidden relative max-w-[1200px] mx-auto`}
                style={{top: `${(-scrollY) % ((size.current + 16) * buffer) + 48}px`}}
            >
                {
                    [...Array(70).keys()].map((i) => {
                        const id = (pos * (buffer * col.current)) + i;

                        let ele = "";
                        if (id < data.length) {
                            let folder = Math.floor(data[id].img / 10000);

                            ele = <>
                                <div className="w-full h-full rounded-lg bg-no-repeat bg-center bg-contain" style={{backgroundImage: `url('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characters/${folders[folder]}/${data[id].img}.webp')`}}></div>
                                <div
                                    className={`absolute w-full min-h-8 bg-zinc-950 text-md text-center align-middle bg-opacity-80 px-4 py-1
                                        bottom-0
                                    `}
                                >
                                    {data[id].name}
                                </div>
                            </>
                        }

                        return (
                            <div className={`relative rounded-lg aspect-square bg-zinc-800
                                ${ele == "" ? "hidden" : ""}
                                ${hover == i ? "brightness-75" : ""}
                            `}

                            
                            >
                                {ele}
                            </div>
                        )
                    })
                }
            </div>
           
        </>
    )
}