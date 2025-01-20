import { useSelector } from 'react-redux';

export default function Anlas() {
    const anlas = useSelector((state) => state.data.anlas);

    return (
        <>
        <div className="text-[#f5f3ce] font-bold text-sm flex items-center justify-center gap-1 px-2.5 py-2 fixed top-[44px] z-10 right-3 bg-zinc-800 rounded-lg shadow-lg hover:cursor-pointer"
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