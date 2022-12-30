module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
	],
	settings: {
		react: {
			version: "detect",
		},
	},
	overrides: [],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["react"],
	ignorePatterns: ["node_modules", "dist"],
	rules: {
		"no-unused-vars": ["error", { args: "none" }],
		"react/prop-types": "off",
	},
};
