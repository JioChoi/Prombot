import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function downloadFile(url) {
  try {
      let res = await axios.get(url, {
          responseType: 'text'
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