/** Markup structure checks for demo HTML; style conventions are not enforced. */
export default {
	extends: ['html-validate:recommended'],
	rules: {
		'attr-delimiter': 'off',
		'void-style': 'off',
		'no-inline-style': 'off',
		'no-trailing-whitespace': 'off',
		'no-raw-characters': 'off',
		'unique-landmark': 'off',
		'wcag/h63': 'off',
		'wcag/h71': 'off',
		'form-dup-name': 'off',
	},
};
