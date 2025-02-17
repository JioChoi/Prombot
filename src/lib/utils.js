import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { unzip } from 'unzipit';
import * as dataSlice from "@/slices/dataSlice";
import * as UPNG from "upng-js";
import { addMetadata } from "meta-png";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import placeholder from "@/assets/img.png"
import editedplaceholder from "@/assets/edited.png"
import landscapeplaceholder from "@/assets/landscape.png"
import { useSelector } from 'react-redux';

let postProcessingWorker = null;
let generateWorker = null;

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

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
		res = await fetch(placeholder);
	}

	let blob = await res.blob();
	return URL.createObjectURL(blob);
}

export async function applyPostProcessing(url, filter) {
	if (!url) return;

	if (postProcessingWorker)
		postProcessingWorker.terminate();
	postProcessingWorker = new Worker('/worker/postProcessing.js', { type: 'module' });

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
	let exif = await extractExif(original, true);
	let comment = JSON.parse(exif.Comment);

	console.log(exif);
	let array = await fetch(target).then(r => r.arrayBuffer());
	array = new Uint8Array(array);

	if (filterOnly) {
		if (comment.config == undefined) {
			comment = {...comment, config: config};
		}
		else {
			comment.config.brightness = config.brightness;
			comment.config.exposure = config.exposure;
			comment.config.contrast = config.contrast;
			comment.config.saturation = config.saturation;
			comment.config.temperature = config.temperature;
			comment.config.tint = config.tint;
			comment.config.shadows = config.shadows;
			comment.config.highlights = config.highlights;
			comment.config.sharpness = config.sharpness;
		}
	}
	else {
		comment = {...comment, config: config};
	}

	let result = await addMetadata(array, "Comment", JSON.stringify(comment));
	result = await addMetadata(result, "Description", exif.Description);
	result = await addMetadata(result, "Title", exif.Title);
	result = await addMetadata(result, "Software", exif.Software);
	result = await addMetadata(result, "Generation_time", exif.Generation_time);
	result = await addMetadata(result, "Source", exif.Source);

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