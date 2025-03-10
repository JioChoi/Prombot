import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux';
import * as dataSlice from "@/slices/dataSlice";

export default function Error() {
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const config = useSelector((state) => state.config);

    useEffect(() => {
        function unhandledrejectionFunc(e) {
            dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
            dispatch(dataSlice.setValue({ key: "generating", value: false }));

            if (config.ignore_errors) {
                if (config.enable_automation)
                    dispatch(dataSlice.setValue({ key: "delay", value: config.delay * 1000 }));
            }
            else {
                setError(e.reason.message);
            }
        }
        window.addEventListener('unhandledrejection', unhandledrejectionFunc);

        return () => {
            window.removeEventListener('unhandledrejection', unhandledrejectionFunc);
        }
    }, [config]);

    return (
        <Dialog open={(error != "")} onOpenChange={() => setError("")}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>An Error Occured!</DialogTitle>
                <DialogDescription>
                    {error}
                </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}