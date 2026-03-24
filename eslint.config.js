import js from "@eslint/js";
import globals from "globals";
import eslintReact from "@eslint-react/eslint-plugin";

export default [
	{ ignores: ["node_modules/**", "dist/**"] },
	js.configs.recommended,
	eslintReact.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			"no-unused-vars": ["error", { args: "none" }],
		},
	},
];
