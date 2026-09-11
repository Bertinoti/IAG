import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"],
    ignores: ["node_modules/**", "storybook-static/**"],
    languageOptions: { parser: tsParser },
  },
];
