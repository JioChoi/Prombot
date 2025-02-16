import { useEffect, useState } from 'react';


export default function HistoryItem({src, config}) {
    const [size, setSize] = useState({width: 0, height: 0});

    useEffect(() => {
        function resizeFunction(e) {
            const imageMod = 0.85;
            let width = window.innerWidth;
            let height = window.innerHeight - 32;

            
            // Object-fit: contain
            let imgWidth = config.width;
            let imgHeight = config.height;

            let imgRatio = imgWidth / imgHeight;
            
            let newWidth = imgWidth * imageMod;
            let newHeight = imgHeight * imageMod;

            if (newWidth > width) {
                newWidth = width * imageMod;
                newHeight = newWidth / imgRatio;
            }

            if (newHeight > height) {
                newHeight = height * imageMod;
                newWidth = newHeight * imgRatio;
            }

            newWidth = Math.round(newWidth * 100) / 100;
            newHeight = Math.round(newHeight * 100) / 100;

            setSize({
                width: newWidth,
                height: newHeight
            });
        }

        resizeFunction();
        window.addEventListener('resize', resizeFunction);

        return () => {
            window.removeEventListener('resize', resizeFunction);
        }
    }, []);

    return (
        <div className="relative" style={{width: size.width + 'px', height: size.height + 'px'}}>
            <img src={src} className="w-full h-full" alt="History Item" />
            <div className="absolute top-0 left-0 bg-black bg-opacity-75 w-full h-full hidden"></div>
        </div>
    );
}