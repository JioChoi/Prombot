import { useEffect, useState, useRef, useMemo, createRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import Icon from "@/components/ui/icon";
import Autocomplete from "@/components/Autocomplete";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import Gallery from "@/components/elements/Gallery";
import { downloadFile } from "@/lib/utils";
import Tab from "@/components/ui/tab";


export default function Characters() {
    const [copyright, setCopyright] = useState(-1);
    const [search, setSearch] = useState("");
    const [faceFocus, setFaceFocus] = useState(true);
    const [selectedCharacter, setSelectedCharacter] = useState("");
    const [datasets, setDatasets] = useState(null);
    const [showFavorite, setShowFavorite] = useState(false);

    useEffect(() => {
        let count = 0;
        let temp = {};

        /* Characters/Characters.json */
        downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characters/characters.json').then((res) => {
            res = JSON.parse(res);
            temp.characters = res;
            count++;
        });
        /* Characters/Copyright.json */
        downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characters/copyright.json').then((res) => {
            res = JSON.parse(res);
            temp.copyright = res;
            count++;
        });

        const interval = setInterval(() => {
            if (count == 2) {
                clearInterval(interval);
                setDatasets(temp);
            }
        }, 100);
    }, []);

    useEffect(() => {
        function hashChangeFunction() {
            let hash = window.location.hash.substring(1);
            if (hash != "") {
                setCopyright(parseInt(hash));
            }
            else {
                setCopyright(-1);
            }
        }

        hashChangeFunction();
        window.addEventListener("hashchange", hashChangeFunction);

        return () => {
            window.removeEventListener("hashchange", hashChangeFunction);
        }
    }, []);

    const data = useMemo(() => {
        if (datasets) {
            if (showFavorite) {
                let favorite = localStorage.getItem("favorite");
                if (favorite == undefined) {
                    favorite = [];
                }
                else {
                    favorite = favorite.split(",");
                }

                let copyright_list = [];
                if (copyright != -1) {
                    copyright_list = datasets.copyright[copyright][2];
                }

                let result = datasets.characters.map((temp, index) => {
                    return {
                        "name": temp.name,
                        "img": temp.id,
                        "type": "character"
                    }
                }).filter((temp) => favorite.includes(temp.name)).filter((temp) => {
                    if (copyright == -1 || copyright_list.includes(temp.img)) {
                        return true;
                    }
                    return false;
                });

                return result;
            }
            else if (copyright == -1) {
                let lowSearch = search.toLowerCase().trim();
                let arrSearch = lowSearch.split(',').map((temp) => temp.trim()).filter((temp) => temp != "");

                let result = datasets.copyright.map((temp, index) => {
                    return {
                        "name": temp[0],
                        "img": datasets.characters[temp[2][0]].id,
                        "id": index,
                        "type": "copyright"
                    }
                }).filter((temp) => temp.name.toLowerCase().includes(lowSearch));

                if (lowSearch != "") {
                    result = result.concat(datasets.characters.map((temp, index) => {
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
                let temp = datasets.copyright[copyright][2];
                return temp.filter((temp) => datasets.characters[temp] != undefined).map((temp, index) => {
                    return {
                        "name": datasets.characters[temp].name,
                        "img": datasets.characters[temp].id,
                        "type": "character"
                    }
                });
            }
        }
    }, [copyright, search, datasets, showFavorite]);

    return (
        <>
        <div className="w-full h-full">
            <div className="bg-zinc-900 w-full h-full relative top-0">
                <div className="w-full h-8 bg-neutral-950 z-40 relative flex flex-row">
                    <Tab title="Generator" selected={false} brighter={true} onClick={() => {
                        window.location.href = "/";
                    }}/>
                    <Tab title="History" selected={false} brighter={false} onClick={() => {
                        window.location.href = "/?tab=1";
                    }}/>
                    <Tab title="Characters" selected={true} brighter={true}/>
                </div>
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.target[0].blur();
                }}>
                    <div className="fixed w-full h-20 z-40 top-[32px] left-0 bg-zinc-800">
                    <div className="h-12 flex items-center hover:cursor-pointer hover:brightness-90 bg-zinc-800"
                        onClick={() => {
                            if (copyright != -1) {
                                window.location.hash = "";
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
                                setSearch(e.target.value);
                                scroll.current.scrollTop = 0; 
                            }}
                            value={search}
                            autocomplete="on"
                        ></input>
                        }
                    </div>
                    <div className="mt-2 ml-4 flex flex-row space-x-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="faceFocus" 
                                checked={ faceFocus }
                                onCheckedChange={(checked) => {
                                    setFaceFocus(checked);
                                }}
                            />
                            <Label htmlFor="faceFocus" className="m-0 hover:cursor-pointer">Focus on Face</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="showFavorite" 
                                checked={ showFavorite }
                                onCheckedChange={(checked) => {
                                    setShowFavorite(checked);
                                }}
                            />
                            <Label htmlFor="showFavorite" className="m-0 hover:cursor-pointer">Only show favorite</Label>
                        </div>
                    </div>
                    <Autocomplete />
                    </div>
                </form>
                
                {
                data == undefined ?
                <div className="w-full h-full flex items-center justify-center">
                    <div>Loading...</div>
                </div>
                :
                <Gallery
                    data={data}
                    onClick={
                        (temp) => {
                            navigator.clipboard.writeText(temp.name);
                        }
                    }
                    imgStyle={faceFocus ? "object-cover object-top" : "object-contain"}
                    favoriteButton={showFavorite || window.location.hash.substring(1) != "" ? true : false}
                />
                }

                <Dialog open={selectedCharacter != ""} onOpenChange={(e) => {setSelectedCharacter("")}}>
                <DialogContent className="z-50 w-[300px] h-[230px]">
                    <DialogHeader>
                    <DialogTitle>{selectedCharacter}</DialogTitle>
                    <DialogDescription className="flex flex-col gap-2 pt-7 text-zinc-300">
                        <Button variant="outline" onClick={(e) => {navigator.clipboard.writeText(selectedCharacter); setSelectedCharacter("")}}>Copy to Clipboard</Button>
                        <Button variant="outline" onClick={(e) => {
                            let temp = localStorage.getItem("favorite");

                            if (temp == undefined || temp == "") {
                                temp = selectedCharacter;
                            }
                            else {
                                if (temp.split(",").includes(selectedCharacter)) {
                                    temp = temp.split(",").filter((temp) => temp != selectedCharacter).join(",");
                                }
                                else {
                                    temp += "," + selectedCharacter;
                                }
                            }
                            localStorage.setItem("favorite", temp);
                            updateToScroll(true);
                            setSelectedCharacter("");
                        }}>{localStorage.getItem("favorite") != undefined && localStorage.getItem("favorite").split(",").includes(selectedCharacter) ? "Remove from Favorite" : "Add to Favorite"}</Button>
                        <Button variant="outline" onClick={(e) => {setSelectedCharacter("")}}>Close</Button>
                    </DialogDescription>
                    </DialogHeader>
                </DialogContent>
                </Dialog>
            </div>
        </div>
        </>
    )
}