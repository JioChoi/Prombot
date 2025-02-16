import Icon from "@/components/ui/icon"
import { useEffect, useRef, useState } from "react"

function checkParents(target, id) {
    if (target.id === id) {
        return true;
    }
    if (target.parentElement) {
        return checkParents(target.parentElement, id);
    }
    return false;
}

export default function Drawer({id, title, items, onClick, onDelete, onButtonClick, buttonLabel, className, buttonClassName, right, icon, listType, selected, width=208, backgroundColor="bg-zinc-800", hideArrowIcon=false}) {
    const [open, setOpen] = useState(false);

    const closeOnClick = useRef((e) => {
        if (!checkParents(e.target, id) && !checkParents(e.target, id + "_button")) {
            setOpen(false);
        }
    });

    useEffect(() => {
        if (open == false) {
            document.removeEventListener("click", closeOnClick.current);
        }
    }, [open]);

    return (
        <>
        <div id={id + "_button"} className={`font-bold text-sm flex items-center justify-center gap-1 fixed top-[35px] z-10 ${right ? "right-[0px]" : "left-[0px]"} mx-[15px] my-[12px] w-[40px] h-[40px] rounded-xl shadow-lg ${buttonClassName} ${backgroundColor} hover:cursor-pointer hover:brightness-110`}
            onClick={()=>{
                setOpen(!open);

                document.addEventListener("click", closeOnClick.current);
            }}
        >
            <Icon name={icon} className="text-3xl"/>
        </div>

        <div id={id} className={`fixed top-[35px] h-[calc(100%-35px)] ${right ? "right-[0px]" : "left-[0px]"} ${className} ${backgroundColor} z-40 shadow-sr transition-margin duration-400
            `}
            style={{
                width: width + "px",
                marginRight: right ? (open ? `0px` : `-${width}px`) : 0,
                marginLeft: right ? 0 : (open ? `0px` : `-${width}px`),
            }}
        >
            <div className={`w-full h-12 flex items-center justify-between border-b-[2px]`}>
                <h1 className="text-lg font-bold ml-4">{title}</h1>
                {(!hideArrowIcon || window.innerWidth < 1024) &&
                <div onClick={() => {setOpen(false)}}>
                    <Icon name={right ? 'right-small-fill' : 'left-small-fill'} className="text-5xl hover:brightness-75 hover:cursor-pointer"/>
                </div>
                }
            </div>
            <div className="w-full h-[calc(100%-48px-48px)] overflow-y-auto">
                {
                    items.map((item, index) => {
                        if (listType === "image") {
                            return (
                                <div key={index} className={`flex items-center justify-between ${backgroundColor} w-[calc(100%-24px)] aspect-square m-3`}>
                                    <div className={`flex items-center w-full h-full border-[2px] ${selected == index ? "border-zinc-500" : "hover:border-zinc-600"} hover:cursor-pointer`}
                                        style={{
                                            backgroundImage: `url(${item.img})`,
                                            backgroundSize: "contain",
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "center",
                                        }}
                                        onClick={()=>{
                                            if (onClick(item, index)) {
                                                setOpen(false);
                                            }
                                        }}
                                    >{item.name}</div>
                                    {/* {
                                        item.deletable !== false &&
                                        <div className="hover:cursor-pointer min-h-11 min-w-11 flex justify-center items-center hover:brightness-75"
                                            onClick={() => {
                                                if(onDelete(item)) {
                                                    setOpen(false);
                                                }
                                            }}
                                        >
                                            <Icon name="delete-2-line" className="text-xl"/>
                                        </div>
                                    } */}
                                </div>
                            )
                        }
                        else {
                            return (
                                <div key={index} className={`flex items-center justify-between border-b-[2px] ${backgroundColor} h-11 hover:brightness-75 hover:cursor-pointer`}>
                                    <div className="pl-4 w-full h-full flex items-center"
                                        onClick={()=>{
                                            onClick(item);
                                            setOpen(false);
                                        }}
                                    >{item.name}</div>
                                    {
                                        item.deletable !== false &&
                                        <div className="hover:cursor-pointer min-h-11 min-w-11 flex justify-center items-center hover:brightness-75"
                                            onClick={() => {
                                                if(onDelete(item)) {
                                                    setOpen(false);
                                                }
                                            }}
                                        >
                                            <Icon name="delete-2-line" className="text-xl"/>
                                        </div>
                                    }
                                </div>
                            )
                        }
                    })
                }
            </div>
            <div className={`w-full h-[48px] flex justify-center items-center ${backgroundColor} hover:brightness-90 hover:cursor-pointer border-t-2`}
                onClick={() => {
                    onButtonClick();
                    setOpen(false);
                }}
            >{buttonLabel}</div>
        </div>
        </>
    )
}