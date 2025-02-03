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

    useEffect(() => {
        window.addEventListener('unhandledrejection', function (e) {
            setError(e.reason.message);
            dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
            dispatch(dataSlice.setValue({ key: "generating", value: false }));
        });
    }, []);

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