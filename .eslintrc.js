module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    
    "no-console": "off", 
    "no-unused-vars": "warn", 
    "@typescript-eslint/no-explicit-any": "off", 
    "@typescript-eslint/explicit-module-boundary-types": "off", 
    "@typescript-eslint/no-non-null-assertion": "off", 

    
    semi: ["warn", "always"], 
    quotes: ["warn", "single"], 
    "@typescript-eslint/no-unused-vars": ["warn"], 
  },
};
