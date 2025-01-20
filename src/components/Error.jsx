import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import { useState, useEffect } from 'react'

export default function Error() {
    const [error, setError] = useState("");

    useEffect(() => {
        window.addEventListener('unhandledrejection', function (e) {
            setError(e.reason.message);
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