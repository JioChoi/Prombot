import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getContainSize, extractExif, getDateString } from "@/lib/utils";
import Icon from "@/components/ui/icon";
import Exif from "@/components/elements/Exif";
import Toolbar from "@/components/elements/Toolbar";

function Result() {
    const data = useSelector((state) => state.data);
    const [size, setSize] = useState({width: 0, height: 0});
    const [exif, setExif] = useState(null);
    const [visibility, setVisibility] = useState(false);
    let animation = "";

    if (data.generating) {
        animation = "generating";
    }

    useEffect(() => {
        (async () => {
            if (data.current_image == "") {
                return;
            }
            setExif(await extractExif(data.current_image));
        })();
    }, [data.current_image]);

    useEffect(() => {
        function resizeFunction(e) {
            const lgwidth = 450;
            if (data.current_image == "") {
                return;
            }

            const imageMod = 0.85;
            let lg = window.innerWidth > 1024;
            let size = getContainSize({width: (window.innerWidth - lg * lgwidth) * imageMod, height: (window.innerHeight - 135 * !lg) * imageMod}, {width: exif.width, height: exif.height});

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
    }, [exif]);

    return (
        <div className={`
        bg-zinc-900 w-screen h-[calc(100%-133px-32px)] fixed top-[32px] left-0 flex items-center justify-center mb-[39px] shadow-md
        lg:w-[calc(100%-450px)] lg:h-[100%] lg:mb-0 lg:static ${animation}
        `}>
            { data.current_image != "" && exif != null &&
                <div style={{
                    position: "relative"
                }}
                onClick={() => {
                    if (window.innerWidth <= 1024)
                        setVisibility(!visibility)
                }}
                onMouseEnter={() => setVisibility(true)}
                onMouseLeave={() => setVisibility(false)}
                >
                    <img src={data.current_image}
                        style={{
                            imageRendering: data.pixelated ? "pixelated" : "auto",
                            width: size.width + "px",
                            height: size.height + "px",
                        }}
                    ></img>

                    <div className="absolute top-0 left-0 w-full h-full bg-black/70 transition-opacity duration-150
                    backdrop-blur-sm"
                        style={{
                            width: size.width + "px",
                            height: size.height + "px",
                            opacity: visibility ? 1 : 0
                        }}
                    >
                        <Exif exif={exif} />
                    </div>
                    
                    <Toolbar imageUrl={data.current_image}/>
                </div>
            }
        </div>
    );
}

export default Result;