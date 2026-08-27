module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false, // for @babel/eslint-parser
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react", "react-hooks", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended", // Prettier should be last
  ],
  rules: {
    "prettier/prettier": [
      "error",
      {
        semi: false,
        singleQuote: true,
        trailingComma: "es5",
        printWidth: 100,
      },
    ],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off", // React 17+ doesn't need import
    "no-unused-vars": ["warn"],
  },
};
