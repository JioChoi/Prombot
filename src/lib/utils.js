import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { unzip } from 'unzipit';
import * as dataSlice from "@/slices/dataSlice";
import * as UPNG from "upng-js";
import { addMetadata } from "meta-png";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import PostProcessingWorker from "@/lib/PostProcessing";

import placeholder from "@/assets/img.png"
import editedplaceholder from "@/assets/edited.png"
import landscapeplaceholder from "@/assets/landscape.png"
import { useSelector } from 'react-redux';

let postProcessingWorker = null;

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

class WebWorker {
	constructor(worker) {
		const code = worker.toString();
		const blob = new Blob([`(${code})()`]);
		return new Worker(URL.createObjectURL(blob));
	}
}

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export async function downloadFile(url, responseType="text") {
	try {
		let res = await axios.get(url, {
			responseType: responseType
		});
		return res.data;
	}
	catch (e) {
		return await downloadFile(url);
	}
}

export let BROWSER = "";

export function Utils() {
	if (typeof window !== "undefined") {
		if (navigator.userAgent.includes("Firefox")) {
			BROWSER = "firefox";
		}
		else if (navigator.userAgent.includes("Chrome")) {
			BROWSER = "chrome";
		}
		else if (navigator.userAgent.includes("Safari")) {
			BROWSER = "safari";
		}
		else if (navigator.userAgent.includes("Edge")) {
			BROWSER = "edge";
		}
		else if (navigator.userAgent.includes("Opera")) {
			BROWSER = "opera";
		}
		else {
			BROWSER = "unknown";
		}
	}
}

export async function decompressFile(data) {
	const { entries } = await unzip(data);
	const name = Object.keys(entries)[0];
	const file = entries[name];

	return file.text();
}

export async function createBlob(landscape=false) {
	let res;
	if (landscape) {
		res = await fetch(landscapeplaceholder);
	}
	else {
		res = await fetch(editedplaceholder);
	}

	let blob = await res.blob();
	return URL.createObjectURL(blob);
}

export async function applyPostProcessing(url, filter) {
	if (!url) return;

	if (postProcessingWorker)
		postProcessingWorker.terminate();
	postProcessingWorker = new WebWorker(PostProcessingWorker);

	let image = new Image();
	image.src = url;
	
	await new Promise((resolve, reject) => { image.onload = resolve; });

	canvas.width = image.width;
	canvas.height = image.height;

	ctx.drawImage(image, 0, 0);

	let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = pixels.data;

	postProcessingWorker.postMessage({ data, filter, width: canvas.width, height: canvas.height, type: "post-processing" });
	
	return new Promise((resolve, reject) => {
		postProcessingWorker.onmessage = async (e) => {
			pixels.data.set(e.data);
			ctx.putImageData(pixels, 0, 0);
	
			let blob = await new Promise((resolve, reject) => {
				canvas.toBlob((blob) => {
					resolve(blob);
				});
			});
			
			postProcessingWorker.terminate();
			let newurl = URL.createObjectURL(blob);

			newurl = await addExif(url, newurl, filter, true);

			resolve(newurl);
		}
	});
}

export function getContainSize(container, size) {
	let width = container.width;
	let height = container.height - 32;

	let imgWidth = size.width;
	let imgHeight = size.height;

	let imgRatio = imgWidth / imgHeight;
	
	let newWidth = imgWidth;
	let newHeight = imgHeight;

	if (newWidth > width) {
		newWidth = width;
		newHeight = newWidth / imgRatio;
	}

	if (newHeight > height) {
		newHeight = height;
		newWidth = newHeight * imgRatio;
	}

	newWidth = Math.round(newWidth * 100) / 100;
	newHeight = Math.round(newHeight * 100) / 100;

	return {width: newWidth, height: newHeight};
}

export async function addHistoryItem(dispatch, url, config) {
	let exif = await extractExif(url);
	dispatch(dataSlice.addValue({key: "history", value: {img: url, config, exif} }));
}

export async function setHistoryItem(dispatch, url, config, index) {
	let exif = await extractExif(url);
	dispatch(dataSlice.setIndex({key: "history", value: {img: url, config, exif}, index: index }));
}

export async function extractExif(url, metadata=false) {
	let res = await fetch(url);
	let arrayBuffer = await res.arrayBuffer();

	let decoded = UPNG.decode(arrayBuffer);
	let exif = "";
	
	if (metadata) {
		exif = decoded.tabs.tEXt;
	}
	else {
		exif = decoded.tabs.tEXt.Comment;
		exif = JSON.parse(exif);
	}

	return exif;
}

export async function addExif(original, target, config, filterOnly=false) {
	let exif = await extractExif(original, false);
	let array = await fetch(target).then(r => r.arrayBuffer());
	array = new Uint8Array(array);

	if (filterOnly) {
		if (exif.config == undefined) {
			exif = {...exif, config: config};
		}
		else {
			exif.config.brightness = config.brightness;
			exif.config.exposure = config.exposure;
			exif.config.contrast = config.contrast;
			exif.config.saturation = config.saturation;
			exif.config.temperature = config.temperature;
			exif.config.tint = config.tint;
			exif.config.shadows = config.shadows;
			exif.config.highlights = config.highlights;
			exif.config.sharpness = config.sharpness;
		}
	}
	else {
		exif = {...exif, config: config};
	}

	let result = await addMetadata(array, "Comment", JSON.stringify(exif));

	let blob = new Blob([result], {type: "image/png"});
	return URL.createObjectURL(blob);
}

export async function zipAndSave(urls) {
	let zip = new JSZip();
	JSZip.support.nodebuffer = false;

	if (urls.length == 0) {
		return;
	}

	for(let i = 0; i < urls.length; i++) {
		let data = await fetch(urls[i]).then(r => r.blob());
		zip.file(`${i}.png`, data);
	}

	await zip.generateAsync({type:"blob"}).then((content) => {
		console.log(content);
		saveAs(content, getDateString() + ".zip");
	});
}

export function getDateString() {
	let date = new Date();
	return `${date.getFullYear() % 2000}${date.getMonth() < 10 ? '0' : ''}${date.getMonth()}${date.getDate() < 10 ? '0' : ''}${date.getDate()}_${date.getHours() < 10 ? '0' : ''}${date.getHours()}${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`;
}