import Result from '../components/Result'
import Sidebar from '../components/Sidebar'
import Popup from '../components/Popup'
import Error  from "../components/Error"
import Presets from "../components/Presets"
import History from "../pages/History"
import Upscale from "../pages/Upscale"
import Tabs from "@/pages/Tabs"

import { useState, useEffect, useReducer, createContext, useRef } from 'react'
import { applyPostProcessing, addHistoryItem, getDateString } from "@/lib/utils";
import { saveAs } from "file-saver";

import * as NAI from "@/lib/NAI";

import { useDispatch, useSelector } from "react-redux";
import * as configSlice from "@/slices/configSlice";
import * as dataSlice from "@/slices/dataSlice";
import Anlas from "../components/Anlas"

const Data = createContext(null);

let last = 0;

function Main() {
	const dispatch = useDispatch();
	const data = useSelector((state) => state.data);
	const config = useSelector((state) => state.config);
	const [tab, setTab] = useState(0);

	async function startGeneration() {
		let _config = config;
		NAI.generate(data.token, _config, (message) => {
			dispatch(dataSlice.setValue({ key: "generate_button_text", value: message }));
		}, () => {
			dispatch(dataSlice.setValue({ key: "generating", value: true }));
		}, async (url) => {
			dispatch(dataSlice.setValue({ key: "result_image", value: url }));
			url = await applyPostProcessing(url, _config, false);
			addHistoryItem(dispatch, url, _config);
			dispatch(dataSlice.setValue({ key: "current_image", value: url }));
			dispatch(dataSlice.setValue({ key: "width", value: _config.width }));
			dispatch(dataSlice.setValue({ key: "height", value: _config.height }));

			dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
			dispatch(dataSlice.setValue({ key: "generating", value: false }));
			
			console.log(config);

			let anlas = await NAI.loadAnlas(data.token);
			dispatch(dataSlice.setValue({key: "anlas", value: anlas}));

			if (config.automatically_download) {
				saveAs(url, getDateString() + ".png");
			}

			if (config.enable_automation) {
				dispatch(dataSlice.setValue({ key: "delay", value: config.delay * 1000 }));
			}
		});
	}

	useEffect(() => {
		function beforeUnloadFunction(e) {
			if (process.env.NODE_ENV != "development" && (data.current_image != "" || data.generating || data.generate_button_text != "")) {
				e.preventDefault();
				e.returnValue = '';
			}
		}
		window.addEventListener('beforeunload', beforeUnloadFunction);

		return () => {
			window.removeEventListener('beforeunload', beforeUnloadFunction);
		}
	}, [data.current_image, data.generating, data.generate_button_text]);

	useEffect(() => {
		if (data.delay > 0) {
			setTimeout(() => {
				if (!config.enable_automation) {
					dispatch(dataSlice.setValue({ key: "delay", value: -1 }));
					dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
				}
				else {
					dispatch(dataSlice.setValue({ key: "generate_button_text", value: `Waiting... (${data.delay / 1000}s)` }));
					dispatch(dataSlice.setValue({ key: "delay", value: data.delay - 100 }));
				}                
			}, 100);
		}

		if (data.delay == 0) {
			dispatch(dataSlice.setValue({ key: "delay", value: -1 }));
			dispatch(dataSlice.setValue({ key: "generate_button_text", value: "" }));
			startGeneration();
		}
	}, [data.delay]);

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

			<Tabs tab={tab} setTab={setTab} />

			<div style={{display: tab != 0 ? "none" : "block"}} className="w-full h-full">
				<Presets />
				<Anlas />
				<div className="
					flex flex-col-reverse 
					lg:flex-row
					h-[calc(100%-32px)]
				">
					<Sidebar generationFunction={startGeneration} />
					<Result />
				</div>
			</div>

			<div style={{display: tab != 1 ? "none" : "block"}} className="w-full h-full">
				<History />
			</div>

			<div style={{display: tab != 3 ? "none" : "block"}} className="w-full h-full">
				<Upscale />
			</div>
		</>
	)
}

export { Main, Data };