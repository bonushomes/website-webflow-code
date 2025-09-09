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
    "no-unused-vars": "off", // Turn off unused vars warnings
    "no-console": "off", // Allow console.log for debugging
    "no-undef": "off", // Turn off undefined variable warnings
    semi: "off", // Turn off semicolon enforcement
    quotes: "off", // Turn off quote enforcement - allow both single and double quotes
    indent: "off", // Turn off indentation enforcement
    "no-trailing-spaces": "off", // Turn off trailing spaces enforcement
    "eol-last": "off", // Turn off end-of-line enforcement
    "no-empty": "off", // Turn off empty block warnings
    "no-unreachable": "error", // Keep this as error - unreachable code is usually a bug
    "no-dupe-keys": "error", // Keep this as error - duplicate keys are bugs
  },
  globals: {
    // Webflow/Webflow-specific globals
    dataLayer: "readonly",
    analytics: "readonly",
    fbq: "readonly",
    google_tag_manager: "readonly",
  },
};
