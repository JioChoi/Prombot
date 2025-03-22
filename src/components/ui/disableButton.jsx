import Icon from "@/components/ui/icon";
import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";

export default function DisableButton({configKey, className}) {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    return (
        <div className={`w-5 h-5 bg-zinc-700 lg:hover:brightness-90 hover:cursor-pointer flex justify-center items-center rounded-sm ${className}`}
            onClick={() => {
                dispatch(configSlice.setValue({ key: configKey, value: !config[configKey] }));
            }}
        >
            {
                config[configKey] ? 
                <Icon name="close_fill" className={`text-md text-zinc-400`} /> :
                <Icon name="check_fill" className={`text-md`} />
            }
        </div>
    );
}