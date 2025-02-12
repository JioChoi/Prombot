import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { unzip } from 'unzipit';
import EditPix from "editpix";

import placeholder from "@/assets/img.png"

const editpix = new EditPix();

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

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

export async function applyPostProcessing(url, filter) {
	if (url == "") {
		return "";
	}
	
	return new Promise(async (resolve, reject) => {
		let image = new Image();
		image.src = url;

		image.onload = async () => {
			image = await changeBrightness(image, filter.brightness + 100);
			// image = await editpix.changeExposure(image, filter.exposure);
			// image = await editpix.changeContrast(image, filter.contrast);
			// image = await editpix.changeSaturation(image, filter.saturation);
			// image = await editpix.changeTemperature(image, filter.temperature);
			// image = await editpix.changeTint(image, filter.tint);
			// image = await editpix.changeShadows(image, filter.shadows);
			// image = await editpix.changeHighlights(image, filter.highlights);
			console.log(image);
			resolve(image);
		};
	});
}

async function changeBrightness(img, value) {
	canvas.width = img.width / 4;
	canvas.height = img.height / 4;
	ctx.filter = `brightness(${value}%)`;
	ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);

	// Return url
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			resolve(URL.createObjectURL(blob));
		});
	});
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
			resolve(result.src);
		};
	});
}