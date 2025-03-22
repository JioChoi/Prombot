import ModuleTitle from '@/components/elements/ModuleTitle';
import ModuleBody from '@/components/elements/ModuleBody';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { useDispatch, useSelector } from 'react-redux';
import * as dataSlice from '@/slices/dataSlice';

export default function Wildcards() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);

    function loadWildcards() {
        let temp = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("__")) {
                const value = localStorage.getItem(key).split('\n');
                temp.push({ key, value });
            }
        }

        temp = temp.sort((a, b) => a.key.localeCompare(b.key));

        dispatch(dataSlice.setValue({ key: "wildcards", value: temp }));
    }

    useEffect(() => {
        loadWildcards();
    }, []);

    return (
        <div>
            <ModuleTitle label="Wildcards" />

            <ModuleBody>
                <div></div>
                <div className="flex flex-col gap-2">
                    {data.wildcards.map((wildcard, index) => {
                        return (
                            <div key={`WC_${index}`} className="flex flex-row justify-between items-center rounded-md px-2 py-1 border border-input">
                                <h1>{wildcard.key.substring(2, wildcard.key.length-2)}</h1>
                                {
                                    wildcard.key != "__FAVORITE__" &&
                                    <Icon name="delete_2_line" className="text-lg hover:cursor-pointer lg:hover:brightness-75" onClick={() => {
                                        localStorage.removeItem(wildcard.key);
                                        loadWildcards();
                                    }}/>
                                }
                            </div>
                        )
                    })}
                </div>
                <Button variant="outline" className="bg-transparent" onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.txt';
                    input.multiple = true;
                    input.onchange = async (e) => {
                        const files = e.target.files;

                        for(const file of files) {
                            const text = await file.text();
                            const lines = text.split('\n');
                            localStorage.setItem(`__${file.name.substring(0, file.name.length - 4)}__`, lines.join('\n'));
                            loadWildcards();
                        }
                    };
                    input.click();
                }}>Upload Wildcard</Button>
            </ModuleBody>
        </div>
    )
};