import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["**/*.js"],
    },
    {
        files: ["**/*.ts"],
        rules: {
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "caughtErrorsIgnorePattern": "^_",
                    "argsIgnorePattern": "^_",
                }
            ],
            "indent": [
                "error", 4,
                {
                    "SwitchCase": 1
                }
            ],
            "quotes": [
                "error",
                "double"
            ],
            "semi": [
                "error",
                "always"
            ],
            "eol-last": [
                "error",
                "always"
            ],
            "object-curly-spacing": [
                "error",
                "never"
            ],
            "no-undef": [
                "off"
            ],
            "func-style": [
                "error",
                "declaration"
            ],
            "array-bracket-spacing": [
                "error",
                "never"
            ],
            "space-infix-ops": [
                "error"
            ],
            "space-before-function-paren": [
                "error",
                "never"
            ],
            "space-in-parens": [
                "error",
                "never"
            ],
            "space-before-blocks": [
                "error",
                "never"
            ]
        },
    }
);
