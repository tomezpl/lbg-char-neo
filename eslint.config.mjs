import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import { ESLint } from "eslint";

export default tseslint.config(
  {
    ignores: ["assets/**/*.js", "**/*.mjs", "dist/**/*", "build.js"],
  },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
  },
  {
    rules: {
      quotes: ["error", "single"],
    }
  }
)