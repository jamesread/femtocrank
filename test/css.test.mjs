import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { contrast, mixHex, parseColor } from './contrast.mjs';
import { extractCustomProperties, readRepoFile, repoPath } from './css-tokens.mjs';

const LIGHT = extractCustomProperties(readRepoFile('style.css'));
const DARK = extractCustomProperties(readRepoFile('dark.css'));

const REQUIRED_LIGHT_TOKENS = [
	'--body-bg-color',
	'--section-bg-color',
	'--standout-bg-color',
	'--text-color',
	'--icon-color',
	'--muted-text-color',
	'--link-color',
	'--control-option-bg-color',
	'--control-hover-bg-color',
	'--control-checked-bg',
	'--control-checked-fg',
	'--disabled-background-color',
	'--disabled-text-color',
	'--scrollbar-track-bg',
	'--scrollbar-thumb-bg',
	'--scrollbar-thumb-hover-bg',
];

const REQUIRED_DARK_OVERRIDES = [
	'--body-bg-color',
	'--section-bg-color',
	'--standout-bg-color',
	'--text-color',
	'--muted-text-color',
	'--link-color',
];

const HTML_PAGES = [
	'index.html',
	'tests/cards.html',
	'tests/color-scheme.html',
	'tests/contrast.html',
	'tests/dialog.html',
	'tests/forms.html',
	'tests/login.html',
	'tests/sidebar-app.html',
	'tests/tables.html',
];

test('style.css and dark.css exist', () => {
	assert.ok(fs.existsSync(repoPath('style.css')));
	assert.ok(fs.existsSync(repoPath('dark.css')));
	assert.ok(readRepoFile('style.css').length > 1000);
});

test('light theme defines layout and control surface tokens', () => {
	for (const token of REQUIRED_LIGHT_TOKENS) {
		assert.ok(LIGHT.has(token), `missing ${token} in style.css`);
	}
});

test('dark.css overrides core theme tokens', () => {
	for (const token of REQUIRED_DARK_OVERRIDES) {
		assert.ok(DARK.has(token), `missing ${token} in dark.css`);
	}
	assert.match(readRepoFile('dark.css'), /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/);
});

test('renamed section token is used and surface token is gone', () => {
	const style = readRepoFile('style.css');
	const dark = readRepoFile('dark.css');
	assert.match(style, /--section-bg-color/);
	assert.doesNotMatch(style, /--surface-bg-color/);
	assert.doesNotMatch(dark, /--surface-bg-color/);
	for (const page of HTML_PAGES) {
		const html = readRepoFile(page);
		assert.doesNotMatch(html, /--surface-bg-color/, `${page} still references --surface-bg-color`);
	}
});

test('demo pages link to the theme stylesheets', () => {
	for (const page of HTML_PAGES) {
		const html = readRepoFile(page);
		assert.match(html, /style\.css/, `${page} should link style.css`);
		assert.match(html, /dark\.css/, `${page} should link dark.css`);
	}
});

test('demo pages include a skip link to main content', () => {
	for (const page of HTML_PAGES) {
		const html = readRepoFile(page);
		assert.match(html, /\ba11yhidden\b/, `${page} should include a skip link`);
		assert.match(html, /href\s*=\s*["']#main-content["']/, `${page} skip link should target #main-content`);
		assert.match(html, /id\s*=\s*["']main-content["']/, `${page} should mark main content with id="main-content"`);
	}
});

test('light theme text meets AA on layout surfaces', () => {
	const text = parseColor(LIGHT.get('--text-color'));
	const surfaces = [
		['body', parseColor(LIGHT.get('--body-bg-color'))],
		['section', parseColor(LIGHT.get('--section-bg-color'))],
		['standout', parseColor(LIGHT.get('--standout-bg-color'))],
	];
	for (const [name, bg] of surfaces) {
		assert.ok(contrast(text, bg) >= 4.5, `${name}: text/background below AA (${contrast(text, bg).toFixed(2)})`);
	}
});

test('light theme icon color matches text color', () => {
	assert.match(LIGHT.get('--icon-color'), /var\(--text-color\)/);
	assert.match(LIGHT.get('--nav-grid-accent-fg'), /var\(--icon-color\)/);
});

test('light theme text meets AAA on layout surfaces', () => {
	const text = parseColor(LIGHT.get('--text-color'));
	const surfaces = [
		parseColor(LIGHT.get('--body-bg-color')),
		parseColor(LIGHT.get('--section-bg-color')),
		parseColor(LIGHT.get('--standout-bg-color')),
	];
	for (const bg of surfaces) {
		assert.ok(contrast(text, bg) >= 7, `text/background below AAA (${contrast(text, bg).toFixed(2)})`);
	}
});

test('light theme muted text meets AAA on layout surfaces', () => {
	const muted = mixHex('#334155', '#ffffff', 96);
	const surfaces = [
		parseColor(LIGHT.get('--body-bg-color')),
		parseColor(LIGHT.get('--section-bg-color')),
		parseColor(LIGHT.get('--standout-bg-color')),
	];
	for (const bg of surfaces) {
		assert.ok(contrast(muted, bg) >= 7, `muted/background below AAA (${contrast(muted, bg).toFixed(2)})`);
	}
});

test('light theme link color meets AA on layout surfaces', () => {
	const link = parseColor(LIGHT.get('--link-color'));
	const surfaces = [
		parseColor(LIGHT.get('--body-bg-color')),
		parseColor(LIGHT.get('--section-bg-color')),
		parseColor(LIGHT.get('--standout-bg-color')),
	];
	for (const bg of surfaces) {
		assert.ok(contrast(link, bg) >= 4.5, `link/background below AA (${contrast(link, bg).toFixed(2)})`);
	}
});

test('light theme control surfaces meet AA for their foreground colors', () => {
	const pairs = [
		['unselected', '#ffffff', '#334155', 4.5],
		['hover', mixHex('#dee3e7', '#ffffff', 45), '#000000', 4.5],
		['checked', mixHex('#5f8f72', '#f8f9fa', 14), '#000000', 4.5],
		['disabled', '#e9e9e9', mixHex('#334155', '#ffffff', 96), 4.5],
	];
	for (const [name, bg, fg, min] of pairs) {
		const ratio = contrast(fg, bg);
		assert.ok(ratio >= min, `${name}: foreground/background ${ratio.toFixed(2)} below ${min}`);
	}
});

test('light theme accent buttons meet AA for on-accent foreground', () => {
	const fg = parseColor(LIGHT.get('--on-accent-fg'));
	const pairs = [
		['submit/good', '--button-good-bg', '--button-good-hover-bg'],
		['reset/bad', '--button-bad-bg', '--button-bad-hover-bg'],
		['cancel/warning', '--button-warning-bg', '--button-warning-hover-bg'],
	];
	for (const [name, bgToken, hoverToken] of pairs) {
		for (const [state, token] of [['default', bgToken], ['hover', hoverToken]]) {
			const bg = parseColor(LIGHT.get(token));
			const ratio = contrast(fg, bg);
			assert.ok(ratio >= 4.5, `${name} ${state}: on-accent/background ${ratio.toFixed(2)} below AA`);
		}
	}
});

test('light theme disabled button meets AA for button disabled foreground', () => {
	const fg = parseColor(LIGHT.get('--button-disabled-fg'));
	const bg = parseColor(LIGHT.get('--button-disabled-bg'));
	const ratio = contrast(fg, bg);
	assert.ok(ratio >= 4.5, `button disabled fg/bg below AA (${ratio.toFixed(2)})`);
});

test('filled karma backgrounds meet AA with karma on-bg foreground', () => {
	const onBg = parseColor(LIGHT.get('--karma-on-bg-fg'));
	const karmaBgs = [
		'--karma-good',
		'--karma-bad',
		'--karma-warning',
		'--karma-severe',
		'--karma-note',
		'--karma-info',
	];
	for (const token of karmaBgs) {
		const bg = parseColor(LIGHT.get(token));
		const ratio = contrast(onBg, bg);
		assert.ok(ratio >= 4.5, `${token} with --karma-on-bg-fg below AA (${ratio.toFixed(2)})`);
	}
});

const KARMA_WASH_TOKENS = [
	['--karma-good-wash', '--karma-good', 12],
	['--karma-bad-wash', '--karma-bad', 15],
	['--karma-warning-wash', '--karma-warning', 18],
	['--karma-severe-wash', '--karma-severe', 15],
	['--karma-note-wash', '--karma-note', 15],
	['--karma-info-wash', '--karma-info', 40],
	['--karma-old-wash', '--karma-old', 18],
];

const KARMA_TINT_TOKENS = [
	['--karma-good-tint', '--karma-good', 45],
	['--karma-bad-tint', '--karma-bad', 65],
	['--karma-warning-tint', '--karma-warning', 50],
	['--karma-severe-tint', '--karma-severe', 45],
	['--karma-note-tint', '--karma-note', 40],
	['--karma-info-tint', '--karma-info', 65],
	['--karma-old-tint', '--karma-old', 50],
];

test('light theme defines karma wash tokens', () => {
	for (const [token] of KARMA_WASH_TOKENS) {
		assert.ok(LIGHT.has(token), `missing ${token} in style.css`);
	}
});

test('light theme defines karma tint tokens', () => {
	for (const [token] of KARMA_TINT_TOKENS) {
		assert.ok(LIGHT.has(token), `missing ${token} in style.css`);
	}
});

test('light theme text meets AA on karma wash backgrounds', () => {
	const text = parseColor(LIGHT.get('--text-color'));
	const standout = parseColor(LIGHT.get('--standout-bg-color'));
	for (const [token, source, pct] of KARMA_WASH_TOKENS) {
		const bg = mixHex(parseColor(LIGHT.get(source)), standout, pct);
		const ratio = contrast(text, bg);
		assert.ok(ratio >= 4.5, `${token} with --text-color below AA (${ratio.toFixed(2)})`);
		assert.equal(LIGHT.get(token).includes(source), true, `${token} should reference ${source}`);
	}
});

test('light theme footer link meets AA on footer chip background', () => {
	const link = parseColor(LIGHT.get('--footer-link-color'));
	const chip = parseColor(LIGHT.get('--footer-chip-bg-color'));
	const ratio = contrast(link, chip);
	assert.ok(ratio >= 4.5, `footer link/chip below AA (${ratio.toFixed(2)})`);
});

test('dark theme footer link meets AA on footer chip background', () => {
	const link = parseColor(DARK.get('--footer-link-color'));
	const chip = parseColor(DARK.get('--footer-chip-bg-color'));
	const ratio = contrast(link, chip);
	assert.ok(ratio >= 4.5, `dark footer link/chip below AA (${ratio.toFixed(2)})`);
});

test('light theme text meets AA on karma tint backgrounds', () => {
	const text = parseColor(LIGHT.get('--text-color'));
	const standout = parseColor(LIGHT.get('--standout-bg-color'));
	for (const [token, source, pct] of KARMA_TINT_TOKENS) {
		const bg = mixHex(parseColor(LIGHT.get(source)), standout, pct);
		const ratio = contrast(text, bg);
		assert.ok(ratio >= 4.5, `${token} with --text-color below AA (${ratio.toFixed(2)})`);
		assert.equal(LIGHT.get(token).includes(source), true, `${token} should reference ${source}`);
	}
});

test('dark theme text meets AA on karma info tint background', () => {
	const text = parseColor(DARK.get('--text-color'));
	const standout = parseColor(DARK.get('--standout-bg-color'));
	const info = parseColor(LIGHT.get('--karma-info'));
	const tintDecl = DARK.get('--karma-info-tint') ?? LIGHT.get('--karma-info-tint');
	const pct = Number(tintDecl.match(/var\(--karma-info\)\s+(\d+)%/)?.[1] ?? 65);
	const bg = mixHex(info, standout, pct);
	const ratio = contrast(text, bg);
	assert.ok(ratio >= 4.5, `dark --karma-info-tint with --text-color below AA (${ratio.toFixed(2)})`);
});

test('dark theme text meets AA on karma warning tint background', () => {
	const text = parseColor(DARK.get('--text-color'));
	const standout = parseColor(DARK.get('--standout-bg-color'));
	const warning = parseColor(DARK.get('--karma-warning') ?? LIGHT.get('--karma-warning'));
	const tintDecl = DARK.get('--karma-warning-tint') ?? LIGHT.get('--karma-warning-tint');
	const pct = Number(tintDecl.match(/var\(--karma-warning\)\s+(\d+)%/)?.[1] ?? 50);
	const bg = mixHex(warning, standout, pct);
	const ratio = contrast(text, bg);
	assert.ok(ratio >= 4.5, `dark --karma-warning-tint with --text-color below AA (${ratio.toFixed(2)})`);
});
