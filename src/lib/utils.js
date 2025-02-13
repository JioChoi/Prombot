import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { unzip } from 'unzipit';

import PostProcessingWorker from "@/lib/PostProcessing";

import placeholder from "@/assets/img.png"

let worker = null;

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

export async function createBlob() {
	let res = await fetch(placeholder);
	let blob = await res.blob();
	return URL.createObjectURL(blob);
}

export async function applyPostProcessing(url, filter) {
	if (!url) return;

	if (worker)
		worker.terminate();
	worker = new WebWorker(PostProcessingWorker);

	let image = new Image();
	image.src = url;
	
	await new Promise((resolve, reject) => { image.onload = resolve; });

	canvas.width = image.width;
	canvas.height = image.height;

	ctx.drawImage(image, 0, 0);

	let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = pixels.data;

	worker.postMessage({ data, filter, width: canvas.width, height: canvas.height, type: "post-processing" });
	
	return new Promise((resolve, reject) => {
		worker.onmessage = async (e) => {
			pixels.data.set(e.data);
			ctx.putImageData(pixels, 0, 0);
	
			let blob = await new Promise((resolve, reject) => {
				canvas.toBlob((blob) => {
					resolve(blob);
				});
			});
			
			url = URL.createObjectURL(blob);
			worker.terminate();
			resolve(url);
		}
	});
}