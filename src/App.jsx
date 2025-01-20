import { ThemeProvider } from "@/components/theme-provider"

import Result from './components/Result'
import Sidebar from './components/Sidebar'
import Popup from './components/Popup'
import Error  from "./components/Error"

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

				let anlas = await NAI.loadAnlas(token);
				dispatch(dataSlice.setValue({key: "anlas", value: anlas}));
			} catch (e) {
				console.log(e);
			}
		})();
	}, []);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<div className="
				flex flex-col-reverse 
				lg:flex-row
			">
				<Error />
				<Popup />
				<Sidebar />
				<Result />
				<Anlas />
			</div>
		</ThemeProvider>
	)
}

export { App, Data };