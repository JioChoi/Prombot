import { useSelector } from 'react-redux';

export default function Anlas() {
    const anlas = useSelector((state) => state.data.anlas);

    return (
        <>
        <div className="text-[#f5f3ce] font-extrabold text-sm flex items-center justify-center gap-1 px-3 h-[40px] fixed top-[44px] z-10 right-3 bg-zinc-800 rounded-xl shadow-lg hover:cursor-pointer hover:brightness-110"
            onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
            }}
        >
            <span>{anlas}</span>
            <img src="https://novelai.net/_next/static/media/anla.23c99491.svg"></img>
        </div>
        </>
    )
}