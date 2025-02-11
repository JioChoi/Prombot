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