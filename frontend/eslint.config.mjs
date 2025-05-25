import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";

export default [
  // Global ignores - replaces .eslintignore
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "ios/**",
      "android/**",
      "dist/**",
      "build/**",
      "babel.config.js",
      "metro.config.js",
      "declarations.d.ts",
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript and React configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // React Native / Expo globals
        __DEV__: "readonly",
        JSX: "readonly",

        // Node.js globals
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly",

        // Browser/Timer globals
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",

        // Crypto API
        crypto: "readonly",

        // React Navigation
        Text: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react: react,
      "react-hooks": reactHooks,
      "react-native": reactNative,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Type safety - keep strict
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-require-imports": "off", // Allow require() for React Native assets
      "@typescript-eslint/prefer-nullish-coalescing": "off", // Disable temporarily
      "@typescript-eslint/prefer-optional-chain": "warn",

      // Console statements - allow in development
      "no-console": "off",

      // Style rules - less strict
      "react-native/no-color-literals": "off",
      "react/no-unescaped-entities": "off",
      "react-native/no-unused-styles": "warn",
      "react/no-array-index-key": "warn",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",

      // Hook dependencies - keep as warnings for review
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import rules
      "no-duplicate-imports": "error",

      // General code quality
      "prefer-const": "error",
      "no-var": "error",
      "no-empty": "warn",
      "no-debugger": "error",

      // Code style
      quotes: [
        "error",
        "single",
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      "jsx-quotes": ["error", "prefer-single"],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
