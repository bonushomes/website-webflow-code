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
    "no-undef": "warn", // Warn instead of error for undefined variables
    semi: ["error", "always"],
    quotes: "off", // Turn off quote enforcement - allow both single and double quotes
    indent: ["warn", 2], // Warn instead of error for indentation
    "no-trailing-spaces": "warn", // Warn instead of error
    "eol-last": "warn", // Warn instead of error
    "no-empty": "warn", // Warn for empty blocks
  },
  globals: {
    // Webflow/Webflow-specific globals
    dataLayer: "readonly",
    analytics: "readonly",
    fbq: "readonly",
    google_tag_manager: "readonly",
  },
};
