import { useSelector } from "react-redux";

function Result() {
    const data = useSelector((state) => state.data);
    let animation = "";

    if (data.generating) {
        animation = "generating";
    }

    return (
        <div className={`
        bg-zinc-900 w-screen h-[calc(100vh-133px)] flex items-center justify-center mb-[39px] shadow-md
        lg:w-[calc(100%-450px)] lg:h-screen lg:mb-0 ${animation}
        `}>
        <img className="max-w-[85%] max-h-[85%]" src={data.current_image}></img>
        </div>
    );
}

export default Result;