import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { HtmlValidate } from 'html-validate';
import config from '../html-validate.config.mjs';
import { repoPath } from './css-tokens.mjs';

const htmlvalidate = new HtmlValidate(config);

const TEST_HTML_DIR = repoPath('tests');

function listTestHtmlFiles() {
	return fs.readdirSync(TEST_HTML_DIR)
		.filter((name) => name.endsWith('.html'))
		.sort()
		.map((name) => path.join('tests', name));
}

function formatReportMessages(report) {
	return report.results.flatMap((result) =>
		result.messages
			.filter((message) => message.severity === 2)
			.map((message) => `${result.filePath}:${message.line}:${message.column} ${message.ruleId} ${message.message}`),
	);
}

test('tests directory contains HTML demo pages', () => {
	const files = listTestHtmlFiles();
	assert.ok(files.length > 0, 'expected at least one HTML file in tests/');
});

for (const relativePath of listTestHtmlFiles()) {
	test(`${relativePath} has valid HTML markup`, async () => {
		const report = await htmlvalidate.validateFile(repoPath(relativePath));
		const errors = formatReportMessages(report);
		assert.equal(errors.length, 0, errors.join('\n'));
	});
}
