import { ThemeProvider } from "@/components/theme-provider"

import Result from './components/Result'
import Sidebar from './components/Sidebar'
import Popup from './components/Popup'
import Error  from "./components/Error"
import Tab from "@/components/ui/tab"
import Presets from "./components/Presets"

import { useState, useEffect, useReducer, createContext, useRef } from 'react'

import * as NAI from "@/lib/NAI";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import * as dataSlice from "@/slices/dataSlice";
import Anlas from "./components/Anlas"

const Data = createContext(null);

function App() {
	const dispatch = useDispatch();

	// On load
    useEffect(() => {
		NAI.downloadDatasets((progress) => {
			dispatch(dataSlice.setValue({key: "generate_button_text", value: `Downloading datasets... (${progress}%)`}));
		}, () => {
			dispatch(dataSlice.setValue({key: "generate_button_text", value: ""}));
			dispatch(dataSlice.setValue({key: "datasets_loaded", value: true}));
		});
		dispatch(configSlice.loadPreset());

		document.body.style.height = window.innerHeight + 'px';
		window.addEventListener('resize', () => {
			document.body.style.height = window.innerHeight + 'px';
		});
		
		(async () => {
			let token = localStorage.getItem('token');

			try {
				await NAI.testAccessToken(token);
				dispatch(dataSlice.setValue({key: "token", value: token}));
				let uid = localStorage.getItem("uid");
				dispatch(dataSlice.setValue({key: "uid", value: uid}));

				let presets = await NAI.loadPresets(uid);
				dispatch(dataSlice.setValue({key: "presets", value: presets}));

				let anlas = await NAI.loadAnlas(token);
				dispatch(dataSlice.setValue({key: "anlas", value: anlas}));
			} catch (e) {
				console.log(e);
			}
		})();
	}, []);

	const [tab, setTab] = useState(0);

	let container = "";
	switch(tab) {
		case 0:
			container =
			<>
				<Presets />
				<Anlas />
				<div className="
					flex flex-col-reverse 
					lg:flex-row
				">
					<Sidebar />
					<Result />
				</div>
			</>;
			break;
		case 1:
			container = 
			<div className="bg-zinc-900 w-full h-full">

			</div>;
			break
	}

	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Popup />
			<Error />

			<div className="w-full h-8 bg-neutral-950 z-40 relative flex flex-row">
				<Tab title="Generator" selected={tab == 0} color='zinc-800' onClick={() => {setTab(0)}}/>
				<Tab title="History" selected={tab == 1} color='zinc-900' onClick={() => {setTab(1)}}/>
			</div>

			{container}
			
		</ThemeProvider>
	)
}

export { App, Data };