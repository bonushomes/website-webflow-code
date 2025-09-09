module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off", // Allow console.log for debugging
    "no-undef": "error",
    semi: ["error", "always"],
    quotes: ["error", "single"],
    indent: ["error", 2],
    "no-trailing-spaces": "error",
    "eol-last": "error",
  },
  globals: {
    // Webflow/Webflow-specific globals
    dataLayer: "readonly",
    analytics: "readonly",
    fbq: "readonly",
    google_tag_manager: "readonly",
  },
};
