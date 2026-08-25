import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

export function readRepoFile(relativePath) {
	return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/** Extract --token: value declarations from a CSS file. */
export function extractCustomProperties(css) {
	const props = new Map();
	for (const match of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s([^;]+);/gim)) {
		props.set(match[1], match[2].trim());
	}
	return props;
}

export function repoPath(relativePath) {
	return path.join(ROOT, relativePath);
}
