import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["src/prismaClient.js"] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",      // erreur → warning
      "@typescript-eslint/no-unused-vars": "warn",       // erreur → warning
      "@typescript-eslint/no-empty-object-type": "warn", // erreur → warning
      "no-useless-assignment": "warn",                   // erreur → warning
    }
  }
);