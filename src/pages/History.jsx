import { useDispatch, useSelector } from "react-redux";
import { addHistoryItem, createBlob, getContainSize, zipAndSave } from "@/lib/utils";
import { useEffect } from "react";
import { config } from "@/lib/NAI";
import HistoryItem from "@/components/elements/HistoryItem";
import { useState } from "react";
import Icon from "@/components/ui/icon";
import Drawer from "@/components/elements/Drawer";
import Exif from "@/components/elements/Exif";
import Toolbar from "@/components/elements/Toolbar";

export default function History() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);
    const [selected, setSelected] = useState(0);
    const [show, setShow] = useState(false);

    const [size, setSize] = useState({width: 0, height: 0});

    // useEffect(() => {
    //     (async () => {
    //         let url = await createBlob(true);
    //         let url2 = await createBlob(false);

    //         addHistoryItem(dispatch, url, config);
    //         addHistoryItem(dispatch, url2, config);
    //         addHistoryItem(dispatch, url, config);
    //         addHistoryItem(dispatch, url2, config);
    //         addHistoryItem(dispatch, url, config);
    //     })();
    // }, []);

    useEffect(() => {
        function resizeFunction(e) {
            const lgwidth = 320 + 168;
            if (data.history.length == 0) {
                return;
            }

            const imageMod = 0.85;
            let lg = window.innerWidth > 1024;
            let size = getContainSize({width: (window.innerWidth - lg * lgwidth) * imageMod, height: window.innerHeight  * imageMod}, {width: data.history[selected].exif.width, height: data.history[selected].exif.height});

            if (lg) {
                size.width += lgwidth - 168;
            }

            setSize({
                width: size.width,
                height: size.height
            });
        }

        resizeFunction();
        window.addEventListener('resize', resizeFunction);

        return () => {
            window.removeEventListener('resize', resizeFunction);
        }
    }, [selected, data.history]);

    useEffect(() => {
        if (data.history.length == 0 || selected == 0) {
            return;
        }
        setSelected(selected + 1);
    }, [data.history]);

    let animation = data.generating ? "generating" : "";

    return (
        <div className="bg-zinc-900 w-full h-[calc(100%-32px)] flex flex-row">
        <div className={`w-full h-full flex items-center justify-center lg:w-[calc(100%-168px)] ${animation}`}>
            {data.history.length != 0 && 
            <div>
            <div className="relative shadow-lg lg:flex" style={{width: size.width + 'px', height: size.height + 'px'}}>
                <img src={data.history[selected].img} className="w-full h-full hover:cursor-pointer lg:hover:cursor-auto lg:w-auto" alt="History Item" />
                <div className={`absolute top-0 left-0 bg-black bg-opacity-80 w-full h-full backdrop-blur-sm
                    lg:relative lg:visible lg:w-[320px] lg:bg-opacity-100
                    transition-opacity duration-150 lg:transition-none lg:opacity-100
                `}
                style={{opacity: !show && window.innerWidth <= 1024 ? 0 : 1}}
                onClick={() => setShow(!show)}
                onMouseLeave={() => setShow(false)}

                >
                    <div className="w-full h-[100%]">
                        <Exif exif={data.history[selected].exif} />
                    </div>
                </div>
            </div>
            <Toolbar imageUrl={data.history[selected].img}/>
            </div>
            }
        </div>

        <Drawer 
            listType="image"
            items={data.history}
            right={true}
            title="History"
            id="history"
            icon="history_anticlockwise_line"
            buttonLabel="Download All"
            selected={selected}
            width={168}
            backgroundColor="bg-zinc-800 lg:bg-zinc-900"
            className="lg:!m-0 lg:!relative lg:!top-0 lg:!h-full lg:!w-[168px]
                        lg:!shadow-3xl"
            buttonClassName="lg:hidden"
            hideArrowIcon={true}
            onButtonClick={() => {
                zipAndSave(data.history.map((item) => item.img));
            }}

            onClick={(item, index) => {
                setSelected(index);
                return false;
            }}
        />
        </div>
    );
}