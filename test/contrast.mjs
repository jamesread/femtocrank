/** WCAG 2.1 relative luminance and contrast helpers. */

const NAMED = {
	white: '#ffffff',
	black: '#000000',
	lightblue: '#add8e6',
	lightgreen: '#90ee90',
	salmon: '#fa8072',
	moccasin: '#ffe4b5',
	lightsalmon: '#ffa07a',
	wheat: '#f5deb3',
};

export function parseColor(value) {
	const v = value.trim().toLowerCase();
	if (v.startsWith('#')) {
		const h = v.slice(1);
		if (h.length === 3) {
			return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
		}
		return `#${h}`;
	}
	const rgb = v.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
	if (rgb) {
		const [r, g, b] = rgb.slice(1).map(Number);
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}
	if (NAMED[v]) {
		return NAMED[v];
	}
	throw new Error(`unsupported color: ${value}`);
}

function channelToLinear(c) {
	const s = c / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
	const h = hex.replace('#', '');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	const R = channelToLinear(r);
	const G = channelToLinear(g);
	const B = channelToLinear(b);
	return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrast(fg, bg) {
	const L1 = luminance(parseColor(fg));
	const L2 = luminance(parseColor(bg));
	const lighter = Math.max(L1, L2);
	const darker = Math.min(L1, L2);
	return (lighter + 0.05) / (darker + 0.05);
}

export function mixHex(c1, c2, pct1) {
	const a = parseColor(c1).replace('#', '');
	const b = parseColor(c2).replace('#', '');
	const p = pct1 / 100;
	const mix = (i) => Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p));
	return `#${mix(0).toString(16).padStart(2, '0')}${mix(2).toString(16).padStart(2, '0')}${mix(4).toString(16).padStart(2, '0')}`;
}
