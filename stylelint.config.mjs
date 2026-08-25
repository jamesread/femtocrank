/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard'],
	ignoreFiles: ['node_modules/**'],
	rules: {
		'selector-class-pattern': null,
		'custom-property-pattern': null,
		'custom-property-empty-line-before': null,
		'selector-attribute-quotes': null,
		'alpha-value-notation': 'number',
		'color-function-alias-notation': null,
		'color-function-notation': 'legacy',
		'declaration-block-no-redundant-longhand-properties': null,
		'media-feature-range-notation': 'prefix',
		'no-descending-specificity': null,
		'property-no-vendor-prefix': null,
		'property-no-deprecated': null,
		'declaration-property-value-keyword-no-deprecated': null,
		'selector-pseudo-element-colon-notation': null,
		'value-no-vendor-prefix': null,
	},
};
