import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getContainSize, extractExif, getDateString } from "@/lib/utils";
import Icon from "@/components/ui/icon";

function Result() {
    const data = useSelector((state) => state.data);
    const [size, setSize] = useState({width: 0, height: 0});
    let animation = "";

    useEffect(() => {
        async function resizeFunction(e) {
            const lgwidth = 450;
            if (data.current_image == "") {
                return;
            }

            let exif = await extractExif(data.current_image);

            const imageMod = 0.85;
            let lg = window.innerWidth > 1024;
            let size = getContainSize({width: (window.innerWidth - lg * lgwidth) * imageMod, height: window.innerHeight  * imageMod}, {width: exif.width, height: exif.height});

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
    }, [data.current_image]);

    return (
        <div className={`
        bg-zinc-900 w-screen h-[calc(100%-133px-32px)] fixed top-[32px] left-0 flex items-center justify-center mb-[39px] shadow-md
        lg:w-[calc(100%-450px)] lg:h-[100%] lg:mb-0 lg:static ${animation}
        `}>
            { data.current_image != "" &&
                <div style={{
                    width: size.width + "px",
                    height: size.height + "px",
                    position: "relative"
                }}>
                    <img src={data.current_image}
                        style={{
                            imageRendering: data.pixelated ? "pixelated" : "auto"
                        }}
                    ></img>
                    <div className="absolute top-1 right-1 w-7 h-7 flex justify-center items-center bg-zinc-900 bg-opacity-70 text-white rounded-md shadow
                        lg:hover:brightness-75 lg:hover:cursor-pointer"
                        onClick={() => {
                            let a = document.createElement("a");
                            a.href = data.current_image;
                            a.download = getDateString() + ".png";
                            a.click();
                        }}
                    >
                        <Icon name="download_2_line" className="text-lg" />
                    </div>
                </div>
            }
        </div>
    );
}

export default Result;