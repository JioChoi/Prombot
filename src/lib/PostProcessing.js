export default () => {
	self.addEventListener("message", (event) => {
		if (event.data.type == "post-processing") {
			let { data, filter, width, height } = event.data;

			let result = postProcessing(data, filter, width, height);
			self.postMessage(result);
		}
	});

	function postProcessing(data, filter, width, height) {
		// let time = performance.now();
		
		data = changeBrightness(data, filter.brightness);
		data = changeExposure(data, filter.exposure);
		data = changeContrast(data, filter.contrast);
		data = changeSaturation(data, filter.saturation);
		data = changeTemperature(data, filter.temperature);
		data = changeTint(data, filter.tint);
		data = changeShadows(data, filter.shadows);
		data = changeHighlights(data, filter.highlights);
		data = changeSharpness(data, width, height, filter.sharpness);

		// time = performance.now() - time;
		// console.log("Post-processing took " + time + "ms");

		return data;
	}

	function rgbToHsl(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;
	
		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
	
		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			l: Math.round(l * 100)
		};
	}
	
	function hslToRgb(h, s, l) {
		s /= 100;
		l /= 100;
		const k = n => (n + h / 30) % 12;
		const a = s * Math.min(l, 1 - l);
		const f = n =>
			l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		return {
			r: 255 * f(0),
			g: 255 * f(8),
			b: 255 * f(4)
		};
	}
	
	function changeBrightness(pixelArray, factor) {
		if (factor == 0)
			return pixelArray;

		for (let i = 0; i < pixelArray.length; i += 4) {
			const hsl = rgbToHsl(pixelArray[i], pixelArray[i + 1], pixelArray[i + 2]);
			hsl.l = Math.max(0, Math.min(100, hsl.l += factor));
			const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	
			pixelArray[i] = rgb.r;
			pixelArray[i + 1] = rgb.g;
			pixelArray[i + 2] = rgb.b;
		}
		return pixelArray;
	}

	function changeExposure(pixelArray, factor) {
		for (let i = 0; i < pixelArray.length; i += 4) {
			const r = pixelArray[i];
			const g = pixelArray[i + 1];
			const b = pixelArray[i + 2];
	
			// Apply exposure adjustment to each channel
			const newR = Math.max(0, Math.min(255, r + factor * 2.55)); // Factor scaled to range 0-255
			const newG = Math.max(0, Math.min(255, g + factor * 2.55));
			const newB = Math.max(0, Math.min(255, b + factor * 2.55));
	
			pixelArray[i] = newR;
			pixelArray[i + 1] = newG;
			pixelArray[i + 2] = newB;
		}
		return pixelArray;
	}

	function changeContrast(pixelArray, factor) {
		factor *= 2;
		factor = (259 * (factor + 255)) / (255 * (259 - factor));
		for (let i = 0; i < pixelArray.length; i += 4) {
			const r = pixelArray[i];
			const g = pixelArray[i + 1];
			const b = pixelArray[i + 2];
	
			// Apply contrast adjustment to each channel
			const newR = Math.max(0, Math.min(255, factor * (r - 128) + 128));
			const newG = Math.max(0, Math.min(255, factor * (g - 128) + 128));
			const newB = Math.max(0, Math.min(255, factor * (b - 128) + 128));
	
			pixelArray[i] = newR;
			pixelArray[i + 1] = newG;
			pixelArray[i + 2] = newB;
		}
		return pixelArray;
	}

	function changeSaturation(pixelArray, factor) {
		if (factor == 0)
			return pixelArray;
		for (let i = 0; i < pixelArray.length; i += 4) {
			let hsl = rgbToHsl(pixelArray[i], pixelArray[i + 1], pixelArray[i + 2]);
			hsl.s = Math.max(0, Math.min(100, hsl.s += factor));
			const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
	
			pixelArray[i] = rgb.r;
			pixelArray[i + 1] = rgb.g;
			pixelArray[i + 2] = rgb.b;
		}
		return pixelArray;
	}

	function changeTemperature(pixelArray, factor) {
		const clip = (value) => {
			return Math.round(Math.min(Math.max(value, 0), 255));
		};
	
		for (let i = 0; i < pixelArray.length; i += 4) {
			if (factor < 0) {
				pixelArray[i] -= clip(Math.abs(factor)); //red
				pixelArray[i + 2] += clip(Math.abs(factor)); //blue
			} else if (factor > 0) {
				pixelArray[i] += clip(Math.abs(factor)); //red
				pixelArray[i + 2] -= clip(Math.abs(factor)); //blue
			}
		}
	
		return pixelArray;
	}

	function changeTint(pixelArray, tint) {
		for (let i = 0; i < pixelArray.length; i += 4) {
			// Apply tint adjustment
			pixelArray[i + 1] += (255 - pixelArray[i + 1]) * (tint / 255);
		}
		return pixelArray;
	}

	function changeShadows(pixelArray, factor) {
		for (let i = 0; i < pixelArray.length; i += 4) {
			const luminance = (pixelArray[i] + pixelArray[i + 1] + pixelArray[i + 2]) / 3;
	
			if (luminance < 128) {
				pixelArray[i] += factor * (128 - luminance) / 128;
				pixelArray[i + 1] += factor * (128 - luminance) / 128;
				pixelArray[i + 2] += factor * (128 - luminance) / 128;
			}
		}
		return pixelArray;
	}

	function changeHighlights(pixelArray, factor) {
		for (let i = 0; i < pixelArray.length; i += 4) {
			const luminance = (pixelArray[i] + pixelArray[i + 1] + pixelArray[i + 2]) / 3;
	
			if (luminance > 128) {
				pixelArray[i] += factor * (255 - luminance) / 128;
				pixelArray[i + 1] += factor * (255 - luminance) / 128;
				pixelArray[i + 2] += factor * (255 - luminance) / 128;
			}
		}
		return pixelArray;
	}

	function changeSharpness(pixelArray, width, height, factor) {
		// Define a sharpening kernel
		const kernel = [
			[0, -1, 0],
			[-1, 5, -1],
			[0, -1, 0]
		];
	
		const tempPixelArray = [...pixelArray];
	
		for (let y = 1; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				let sumR = 0, sumG = 0, sumB = 0;
				for (let ky = -1; ky <= 1; ky++) {
					for (let kx = -1; kx <= 1; kx++) {
						const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
						const weight = kernel[ky + 1][kx + 1];
						sumR += tempPixelArray[pixelIndex] * weight;
						sumG += tempPixelArray[pixelIndex + 1] * weight;
						sumB += tempPixelArray[pixelIndex + 2] * weight;
					}
				}
				const index = (y * width + x) * 4;
				pixelArray[index] = tempPixelArray[index] + factor * sumR;
				pixelArray[index + 1] = tempPixelArray[index + 1] + factor * sumG;
				pixelArray[index + 2] = tempPixelArray[index + 2] + factor * sumB;
			}
		}
	
		return pixelArray;
	}	
}