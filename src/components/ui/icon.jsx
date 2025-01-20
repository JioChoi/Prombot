import 'mingcute_icon/font/Mingcute.css'
import ximg from '@/assets/x.png'
import x_sel_img from '@/assets/x-sel.png'

export default function Icon({name, className, x=false, sel=false}) {
    name = `mgc_${name.replaceAll('-', '_')}`;

    if (x) {
        let img = sel ? x_sel_img : ximg;

        return (
            // Stack two icons on top of each other
            <div className={`${className} relative inline-block flex items-center select-none pointer-events-none`}>
                <span className={`${name} ${className}`}></span>
                
                <img src={img} className="absolute top-0 left-0 h-full"/>
            </div>
        );
    }
    
    return (
        <span className={`${className} ${name}`}></span>
    );
}