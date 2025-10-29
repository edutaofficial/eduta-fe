import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  // Global ignores - must be first
  // Migrated from .eslintignore (no longer supported in flat config)
  {
    ignores: [
      // Dependencies
      "**/node_modules/**",
      "**/.pnp/**",
      "**/.pnp.*",
      "**/.yarn/**",
      "!**/.yarn/patches/**",
      "!**/.yarn/plugins/**",
      "!**/.yarn/releases/**",
      "!**/.yarn/versions/**",
      
      // Testing
      "**/coverage/**",
      
      // Next.js
      "**/.next/**",
      "**/out/**",
      
      // Production
      "**/build/**",
      
      // Misc
      "**/.DS_Store",
      "**/*.pem",
      
      // Debug logs
      "**/npm-debug.log*",
      "**/yarn-debug.log*",
      "**/yarn-error.log*",
      "**/.pnpm-debug.log*",
      
      // Environment files
      "**/.env*",
      
      // Vercel
      "**/.vercel/**",
      
      // TypeScript
      "**/*.tsbuildinfo",
      "**/next-env.d.ts",
    ],
  },

  // Base JavaScript configuration
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // TypeScript configuration
  ...tseslint.configs.recommended,

  // Next.js Core Web Vitals configuration
  ...compat.extends("next/core-web-vitals"),

  // React configuration with strict rules
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
    rules: {
      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // Using TypeScript
      "react/jsx-uses-react": "off", // Not needed in Next.js
      "react/jsx-uses-vars": "error",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-pascal-case": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/no-deprecated": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-unescaped-entities": "error",
      "react/no-unknown-property": "error",
      "react/no-unsafe": "error",
      "react/require-render-return": "error",
      "react/self-closing-comp": "error",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/iframe-has-title": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/no-access-key": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/no-distracting-elements": "error",
      "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/scope": "error",
      "jsx-a11y/tabindex-no-positive": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // General code quality rules
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    rules: {
      // Semicolons - enforce consistent semicolon usage
      "semi": ["error", "always"],
      "semi-spacing": ["error", { before: false, after: true }],
      "semi-style": ["error", "last"],

      // Code style
      "quotes": ["error", "double", { avoidEscape: true }],
      "quote-props": ["error", "as-needed"],
          "comma-dangle": "off",
      "comma-spacing": ["error", { before: false, after: true }],
      "comma-style": ["error", "last"],
      "computed-property-spacing": ["error", "never"],
      "func-call-spacing": "off",
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "keyword-spacing": ["error", { before: true, after: true }],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "space-before-blocks": ["error", "always"],
      "space-before-function-paren": "off",
      "space-in-parens": ["error", "never"],
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": ["error", "always"],
      "template-curly-spacing": ["error", "never"],

      // Best practices
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "prefer-destructuring": ["error", { object: true, array: false }],
      "no-duplicate-imports": "error",
      "no-unused-vars": "off", // Handled by TypeScript
      "no-undef": "off", // Handled by TypeScript
      "no-unreachable": "error",
      "no-unused-expressions": "error",
      "no-useless-return": "error",
      "no-useless-escape": "error",
      "no-useless-concat": "error",
      "no-useless-constructor": "error",
      "no-useless-rename": "error",
      "object-shorthand": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",

      // TypeScript specific rules (basic ones that don't require type info)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/space-before-function-paren": "off",
    },
  },
];

export default config;