import Icon from "@/components/ui/icon";
import { useState } from "react";


export default function GalleryItem({onClick, favoriteButton, src, label, imgStyle, favoriteState, hoverText}) {
    const [favorite, setFavorite] = useState(favoriteState);
    const [_hoverText, setHoverText] = useState(hoverText);

    const temp = [];
    if (favoriteButton) {
        temp.push(
            <div key={"fav_btn"} className="absolute top-1 right-1 w-[28px] h-[28px] bg-black flex align-middle justify-center rounded-full hover:cursor-pointer hover:brightness-90"
                onClick={() => {
                    let fav = localStorage.getItem("__FAVORITE__");
                    if (fav == undefined) {
                        fav = [];
                    }
                    else {
                        fav = fav.split("\n");
                    }
                    if (fav.includes(label)) {
                        fav = fav.filter((temp) => temp != label);
                        setFavorite(false);
                    }
                    else {
                        fav.push(label);
                        setFavorite(true);
                    }
                    localStorage.setItem("__FAVORITE__", fav.join("\n"));
                }}
            ><Icon name="star-fill" className={`text-lg ${favorite ? "text-yellow-400" : "text-zinc-200"}`}/></div>
        )
    }

    return (
        <div className={`relative rounded-lg aspect-square bg-zinc-800 overflow-hidden hover:cursor-pointer`}
            onClick={() => {
                setHoverText("Copied!");
                setTimeout(() => {
                    setHoverText(hoverText);
                }, 1000);
                onClick();
            }}
        >
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50 text-white text-md font-medium opacity-0 hover:opacity-100 transition-opacity duration-75">{_hoverText}</div>
            {temp}
            <img className={"w-full h-full pointer-events-none " + imgStyle} loading="lazy"
                src={src}
            >
            </img>
            <div
                className={`absolute w-full min-h-2 bg-zinc-950 text-sm text-center align-middle bg-opacity-80 px-4 py-1
                    bottom-0
                `}
            >
                {label}
            </div>
        </div>
    )
}