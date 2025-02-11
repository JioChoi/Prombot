import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { unzip } from 'unzipit';

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