import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { unzip } from 'unzipit';
import EditPix from "editpix";

import placeholder from "@/assets/img.png"

const editpix = new EditPix();

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

function applyFilter(filter) {
	ctx.filter =
		`
		brightness(${filter.brightness + 100}%)
		contrast(${filter.contrast + 100}%)
		saturate(${filter.saturation + 100}%)
		`;
}

export async function applyPostProcessing(url, filter, fast, abortController=null, dispatch=null) {
	if (url == "") {
		return "";
	}

	return new Promise(async (resolve, reject) => {		
		let timeout = null;

		abortController && abortController.signal.addEventListener("abort", () => {
			if (timeout) {
				clearTimeout(timeout);
			}
			reject("Aborted");
		}, { once: true });
		
		let image;

		// Preview
		if (fast) {
			image = await resizeImage(url, -90);										if (abortController && abortController.signal.aborted) return;

			image = await editpix.changeBrightness(image, filter.brightness);			if (abortController && abortController.signal.aborted) return;
			image = await editpix.changeExposure(image, filter.exposure);				if (abortController && abortController.signal.aborted) return;
			image = await changeContrast(image, filter.contrast);						if (abortController && abortController.signal.aborted) return;
			image = await editpix.changeSaturation(image, filter.saturation);			if (abortController && abortController.signal.aborted) return;
			image = await editpix.changeTemperature(image, filter.temperature);			if (abortController && abortController.signal.aborted) return;
			image = await editpix.changeTint(image, filter.tint);						if (abortController && abortController.signal.aborted) return;
			image = await editpix.changeShadows(image, filter.shadows);					if (abortController && abortController.signal.aborted) return;
			image = await editpix.changeHighlights(image, filter.highlights);			if (abortController && abortController.signal.aborted) return;
	
			dispatch && dispatch(image.src);														if (abortController && abortController.signal.aborted) return;
		}
		//await new Promise((resolve, reject) => { timeout = setTimeout(resolve, 500); });


		// Real
		image = new Image();
		image.src = url;

		await new Promise((resolve, reject) => { image.onload = resolve; });

		image = await editpix.changeBrightness(image, filter.brightness);			if (abortController && abortController.signal.aborted) return;
		image = await editpix.changeExposure(image, filter.exposure);				if (abortController && abortController.signal.aborted) return;
		image = await changeContrast(image, filter.contrast);						if (abortController && abortController.signal.aborted) return;
		image = await editpix.changeSaturation(image, filter.saturation);			if (abortController && abortController.signal.aborted) return;
		image = await editpix.changeTemperature(image, filter.temperature);			if (abortController && abortController.signal.aborted) return;
		image = await editpix.changeTint(image, filter.tint);						if (abortController && abortController.signal.aborted) return;
		image = await editpix.changeShadows(image, filter.shadows);					if (abortController && abortController.signal.aborted) return;
		image = await editpix.changeHighlights(image, filter.highlights);			if (abortController && abortController.signal.aborted) return;
		dispatch && dispatch(image.src);														if (abortController && abortController.signal.aborted) return;

		resolve(image.src);
	});
}

async function changeContrast(image, value) {
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext("2d");

	canvas.width = image.width;
	canvas.height = image.height;

	ctx.filter = `contrast(${value + 100}%)`;
	ctx.drawImage(image, 0, 0);

	let blob = await new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		});
	});

	image.src = URL.createObjectURL(blob);

	await new Promise((resolve, reject) => { image.onload = resolve; });

	return image;
}

export async function createBlob() {
	let res = await fetch(placeholder);
	let blob = await res.blob();
	return URL.createObjectURL(blob);
}

export async function resizeImage(url, percentage) {
	let image = new Image();
	image.src = url;
	
	return new Promise((resolve, reject) => {
		image.onload = async () => {
			let result = await editpix.resizeByPercentage(image, percentage);
			resolve(result);
		};
	});
}