import { useEffect, useState, useRef } from "react";
import GalleryItem from "@/components/elements/GalleryItem";

export default function Gallery({data, onClick, imgStyle, favoriteButton}) {
    const [elements, dispatchElements] = useState([]);
    const [scrollHeight, dispatchScrollHeight] = useState(0);
    const [elementsHeight, dispatchElementsHeight] = useState(0);
    const scroll = useRef(null);
    const buffer = 100;
    const prvScrollY = useRef(0);
    const prvImgStyle = useRef(imgStyle);

    useEffect(() => {
        updateElementsHeight();
    }, [elements]);

    useEffect(() => {
        window.addEventListener("resize", () => {
            updateScrollHeight();
        });
    }, []);

    function updateElementsHeight() {
        let width = window.innerWidth;
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

        let width = window.innerWidth;
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

        let favorites = localStorage.getItem("__FAVORITE__");
        if (favorites == undefined) {
            favorites = [];
        }
        else {
            favorites = favorites.split("\n");
        }

        let temp = [...Array(bf).keys()].map((i) => {
            let temp = data[start + i];
            if (temp == undefined) {
                return;
            }
            let folder = Math.floor(temp.img / 10000);

            return (
                <GalleryItem 
                    key={temp.id + temp.name}
                    onClick={() => {
                        if (temp.type != "character") {
                            window.location.hash = temp.id;
                            prvScrollY.current = scroll.current.scrollTop;
                        }
                        else {
                            onClick(temp);
                        }
                    }}
                    favoriteButton={temp.type == "character"}
                    src={`https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characters/${folder}/${temp.img}.webp`}
                    label={temp.name}
                    imgStyle={imgStyle}
                    favoriteState={favorites.includes(temp.name)}
                    hoverText={temp.type != "character" ? "" : "Click to Copy"}
                />
            )
        });

        if (!clear) {
            temp = [...elements, ...temp];
        }

        dispatchElements(temp);
    }

    useEffect(() => {
        updateScrollHeight();
        updateToScroll(true);
    }, [data]);

    useEffect(() => {
        if (window.location.hash.substring(1) == "") {
            scroll.current.scrollTop = prvScrollY.current;
        }
        else {
            scroll.current.scrollTop = 0;
        }
    }, [scrollHeight]);

    if (prvImgStyle.current != imgStyle) {
        prvImgStyle.current = imgStyle;
        updateToScroll(true);
    }


    return (
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
    );
}