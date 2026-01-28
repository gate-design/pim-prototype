# PIM Prototype

React + TypeScript + Vite prototype for the PIM product.

## Deploying to GitHub Pages

The repo is set up to deploy this app to GitHub Pages via GitHub Actions.

1. **Push the repo** to your company GitHub (e.g. `main` or `master`).
2. **Enable GitHub Pages**: in the repo go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. **Trigger a deploy**: the workflow runs on every push to `main`/`master`. You can also run it manually from **Actions → Deploy to GitHub Pages → Run workflow**.
4. **Share the URL**: once deployed, the site is at `https://<org-or-user>.github.io/<repo-name>/`. For example, if the repo is `pim-prototype` under `mycompany`, the URL is `https://mycompany.github.io/pim-prototype/`.

**If your repo name is not `pim-prototype`**, update the `base` in `vite.config.ts` to match (e.g. `base: '/PIM-Prototype/'` for a repo named `PIM-Prototype`). The `base` must be `/<repo-name>/` so assets load correctly on GitHub Pages.

## Design system

UI follows the **Nest UI Kit** (Figma). Buttons and tokens are documented in [`docs/design-system.md`](docs/design-system.md). Use the shared `<Button>` from `src/components/ui/Button` or the `.btn` classes from `src/styles/buttons.css` for all new pages and components.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
