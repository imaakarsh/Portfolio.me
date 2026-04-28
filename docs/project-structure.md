# Project Structure

## Current layout

```text
Portfolio/
├ public/
│  ├ index.html
│  ├ style.css
│  ├ assets/
│  └ dist/
├ src/
├ docs/
├ package.json
├ package-lock.json
├ tsconfig.json
└ README.md
```

## Responsibility split

- `public/index.html` is the static entry point for the portfolio.
- `public/style.css` owns the presentation layer.
- `public/assets/` stores images, icons, and other media.
- `public/dist/` contains the browser-ready JavaScript output.
- `src/` contains the TypeScript source.
- `docs/` stores project notes and structure documentation.

## Suggested next split if you want a deeper organization

```text
src/
├ app/
├ effects/
├ features/
└ utils/
```

This repo is already functionally organized. The next real structural step would be splitting the TypeScript into those folders, which can be done without changing behavior.