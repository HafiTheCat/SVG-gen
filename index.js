// returns a window with a document and an svg root node
import { mkdirSync } from "fs";
import Color from "color";
import { createSVGWindow } from "svgdom";
import { SVG, registerWindow } from "@svgdotjs/svg.js";

import sharp from "sharp";

try {
	mkdirSync("output");
} catch (e) {
	console.log("output folder already exists");
}

/**
 * creates hue shifted colors from a starting color
 * @param hexcolor Color in hex format
 * @param ratio How many color entries should it generate
 */
const getColorArray = (hexcolor, amount) => {
	const color = Color(hexcolor).hsl().object();
	const colorArray = [];
	for (let i = 0; i < amount; i++) {
		colorArray.push(
			Color({ h: (360 / amount) * i, s: color.s, l: color.l })
				.hex()
				.toString()
		);
	}
	return colorArray;
};

/**
 * Gets a darker color variant
 * @param hexcolor Color in hex format
 * @param ratio How much darker or lighter the result will be
 */
const getDarkerColor = (hexcolor, ratio = 10) => {
	const color = Color(hexcolor).hsl().object();
	return Color({ h: color.h, s: color.s, l: color.l - ratio })
		.hex()
		.toString();
};

/**
 * Creates a card with a color pair
 * @param canvas SVG canvas context
 * @param colorpair Colorpair of a primary and secondary color
 */
const createCard = (canvas, colorpair = ["#fff", "#000"]) => {
	let gradient = canvas.gradient("linear");
	gradient.stop({ offset: 0, color: colorpair[0], opacity: 1 });
	gradient.stop({ offset: 0, color: colorpair[1], opacity: 1 });
	gradient.from(0, 0).to(0, 1);
	canvas.rect(128, 224).fill(gradient);
	canvas
		.rect(128 - 4, 224 - 4)
		.move(2, 2)
		.fill({ opacity: 0 })
		.stroke({ color: "#000", opacity: 0.25, width: 4 });
	canvas
		.rect(128 - 8, 26)
		.move(4, 224 - 26 - 4)
		.fill({ opacity: 0.25 });
	canvas
		.rect(128 - 8 - 8, 37)
		.move(8, 224 - 26 - 12 - 37)
		.fill({ opacity: 0.25 });
	canvas.viewbox(0, 0, 128, 224);
	return canvas;
};

/**
 * Outputs files using sharp
 * @param filename Name of the output filename
 * @param canvas SVG canvas context
 */
const outputSVG = (filename, canvas) => {
	const config = {
		quality: 100,
		alphaQuality: 100,
		nearLossless: true,
	};
	const SVG_BUFFER = Buffer.from(canvas.svg());
	sharp(SVG_BUFFER).resize(128, 224).webp().toFile(`output/${filename}.webp`);
	sharp(SVG_BUFFER).resize(128, 224).jpeg(config).toFile(`output/${filename}.jpg`);
	sharp(SVG_BUFFER).resize(128, 224).png(config).toFile(`output/${filename}.png`);
	sharp(SVG_BUFFER).resize(128, 224).avif(config).toFile(`output/${filename}.avif`);
	sharp(SVG_BUFFER).resize(128, 224).tiff(config).toFile(`output/${filename}.tiff`);
};

const main = () => {
	const col = Color({ h: 83, s: 100, l: 45 }).hex().toString();
	let colarr = getColorArray(col, 20);

	colarr = colarr.map((c) => {
		return [c, getDarkerColor(c)];
	});

	colarr.forEach((colorPair, i) => {
		const window = createSVGWindow();
		const document = window.document;

		// register window and document
		registerWindow(window, document);

		// create canvas
		let canvas = SVG(document.documentElement);
		let svg = createCard(canvas, colorPair);
		outputSVG(i, svg);
	});
};
main();
