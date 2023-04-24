module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'import/no-unresolved': ['error', { 'ignore': ['^jquery'] }],
		'import/order': [
			'error',
			{
				'newlines-between': 'always',
				'groups': [
					'type',
					'external',
					'internal'
				]
			}
		],
		'template-curly-spacing': ['error', 'always'],
		'comma-dangle': ['error', 'always-multiline'],
		'curly': 'off',
		'nonblock-statement-body-position': ['error', 'below'],
		'one-var': 'off',
		'operator-linebreak': ['error', 'before'],
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'object-curly-newline': ['error', { 'consistent': true }],
		'keyword-spacing': ['error', { 'before': true, 'after': true }],
		'semi': 'error',
		'brace-style': 'error',
		'no-empty-function': 'off',
		'babel/no-invalid-this': 'off',
		'import/no-anonymous-default-export': 'off',
		'no-console': 'off',
		'no-new': 'off',
		'node/shebang': 'off',
		'babel/camelcase': 'off',
		'no-negated-condition': 'warn',
		'consistent-return': 'off',
		'no-tabs': 'off',
		'indent-legacy': 'off',
		'no-mixed-operators': 'off',
		'line-comment-position': 'off',
		'require-await': 'off',
		'prefer-rest-params': 'off',
		'no-fallthrough': 'off',
		'@typescript-eslint/no-empty-function': ['error', { 'allow': ['arrowFunctions', 'constructors'] }],
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-types': ['error',
			{
				'types': {
					'String': false,
					'Boolean': false,
					'Number': false,
					'Symbol': false,
					'{}': false,
					'Object': false,
					'object': false,
					'Function': false,
				},
				'extendDefaults': true,
			},
		],
		'key-spacing': [
			'error',
			{
				'beforeColon': true,
				'align': {
					'beforeColon': true,
					'afterColon': true,
					'on': 'colon',
				},
			},
		],
		'@typescript-eslint/no-empty-interface': [
			'error',
			{
				'allowSingleExtends': true,
			},
		],
	},
};
