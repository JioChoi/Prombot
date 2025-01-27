import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "./ui/button"

import { Data } from "@/App"
import { useRef, useState } from "react"

import { login, loadAnlas, loadPresets } from "@/lib/NAI"

import { useDispatch, useSelector } from "react-redux";
import * as dataSlice from "@/slices/dataSlice";

export default function Popup() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);

    let styles = "opacity-0 pointer-events-none";
    if (data.login_popup) {
        styles = "opacity-100 pointer-events-auto";
    }

    const [error_msg, setErrorMsg] = useState("");
    const [checking, setChecking] = useState(false);

    let id = useRef();
    let pw = useRef();

    return (
        <div className={`${styles} fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center duration-300 transition-opacity`} >
            {
                data.login_popup ?
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Login with Novel AI Account</CardDescription>
                    </CardHeader>
                    <form onSubmit={
                        async (e)=>{
                            e.preventDefault();
                            setChecking(true);
                            
                            let token = await login(id.current.value, pw.current.value);
                            if (token == null) {
                                setErrorMsg("Invalid email or password.");
                            }
                            else {
                                let anlas = await loadAnlas(token);
                                dispatch(dataSlice.setValue({key: "anlas", value: anlas}));
                                dispatch(dataSlice.setValue({key: "uid", value: localStorage.getItem("uid")}));
                                dispatch(dataSlice.setValue({key: "token", value: token}));
                                dispatch(dataSlice.setValue({key: "login_popup", value: false}));

                                let presets = await loadPresets(localStorage.getItem("uid"));
                                dispatch(dataSlice.setValue({key: "presets", value: presets}));
                            }

                            setChecking(false);
                        }}
                    >
                        <CardContent className="flex flex-col gap-3">
                            {
                                error_msg === "" ? null : 
                                <Alert className="text-red-500 border-red-500">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error_msg}</AlertDescription>
                                </Alert>
                            }
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" ref={id} type="email" placeholder="Email" />
                                </div>
                                
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" ref={pw} type="password" placeholder="Password" />
                                </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button className=""
                                    type="submit"
                                    disabled={checking}
                                    >Login</Button>
                            <Button className="" variant="outline" type="button"
                                onClick={()=>{
                                    dispatch(dataSlice.setValue({key: "login_popup", value: false}));
                                }}
                                disabled={checking}
                                >Cancel</Button>
                        </CardFooter>
                    </form>
                </Card> : null
            }
        </div>
    )
}