import Result from '../components/Result'
import Sidebar from '../components/Sidebar'
import Popup from '../components/Popup'
import Error  from "../components/Error"
import Tab from "@/components/ui/tab"
import Presets from "../components/Presets"
import { Link } from "react-router-dom"
import History from "../pages/History"

import { useState, useEffect, useReducer, createContext, useRef } from 'react'

import * as NAI from "@/lib/NAI";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import * as dataSlice from "@/slices/dataSlice";
import Anlas from "../components/Anlas"

const Data = createContext(null);

function Main() {
	const dispatch = useDispatch();
	const data = useSelector((state) => state.data);
	const [tab, setTab] = useState(0);

	useEffect(() => {
		function beforeUnloadFunction(e) {
			if (data.current_image != "" || data.generating || data.generate_button_text != "") {
				e.preventDefault();
				e.returnValue = '';
			}
		}
		window.addEventListener('beforeunload', beforeUnloadFunction);

		return () => {
			window.removeEventListener('beforeunload', beforeUnloadFunction);
		}
	}, [data.current_image, data.generating, data.generate_button_text]);

	// On load
    useEffect(() => {
		// Load on tab
		const params = new URLSearchParams(window.location.search);
		if (params.has("tab")) {
			setTab(parseInt(params.get("tab")));
		}

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

	return (
		<>
			<Popup />
			<Error />

			<div className="w-full h-8 bg-neutral-950 z-40 relative flex flex-row">
				<Tab title="Generator" selected={tab == 0} brighter={true} onClick={() => {setTab(0)}}/>
				<Tab title="History" selected={tab == 1} brighter={false} onClick={() => {setTab(1)}}/>
				<Tab title="Characters" selected={tab == 2} brighter={true} onClick={() => {
					window.location.href = "/characters";
				}}/>
			</div>

			<div style={{display: tab != 0 ? "none" : "block"}} className="w-full h-full">
				<Presets />
				<Anlas />
				<div className="
					flex flex-col-reverse 
					lg:flex-row
					h-[calc(100%-32px)]
				">
					<Sidebar />
					<Result />
				</div>
			</div>

			<div style={{display: tab != 1 ? "none" : "block"}} className="w-full h-full">
				<History />
			</div>
		</>
	)
}

export { Main, Data };