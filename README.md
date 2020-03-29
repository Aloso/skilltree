# hello_world
A template for a [typescript](https://www.typescriptlang.org)/[sass](https://sass-lang.com) web app, with polyfills and a CSS reset

## Highlights

- Webpack 4, Typescript, TSLint/ESLint, Sass
- Polyfills ([core-js](https://github.com/zloirock/core-js), [regenerator-runtime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime)) and a CSS reset ([normalize.css](https://necolas.github.io/normalize.css/))
- [Hot reloading](https://webpack.js.org/concepts/hot-module-replacement) of stylesheets and selected TypeScript modules
- Source maps, css extraction
- Code minification in production mode

## Get started!

1. Click the green **Use this template** button at the top, choose a name and clone it.
2. Run `npm install` (you can ignore warnings for `sass-loader` and `fsevents`)
3. Replace the metadata in `package.json`
4. Insert the current year and your name in `LICENSE` after "Copyright (c)"
5. Search for comments starting with `TODO:`, here you probably have to do something
6. Start the development server with `npm start`
7. Start coding!

## Features

- Typescript configuration with
  - Source maps
  - `esnext` module syntax, e.g. `import { Foo } from 'bar'`
  - `strict`, `noImplicitAny`: catches many bugs/mistakes with stricter type checking

- TSLint/ESLint: Enforce good coding practices, as well as a uniform code style
  - Indent with spaces
  - No semicolons
  - Single quotes for strings
  - Trailing commas (better for diff tools)
  - Enforce `const`/`readonly` where possible
  - Enforce `===` in most cases
  - No fall-through in `switch`
  - ...

- Webpack bundler
  - Configured to bundle JS, TS, CSS and Sass files, with source maps
  - Stylesheets are extracted to separate files
  - Output is in `./dist`
  - **Development** mode, featuring _live reloading_ and _[hot module replacement](https://webpack.js.org/concepts/hot-module-replacement)_:
    - Start development server with `npm start` (recommended)
    - Compile once with `npm run build`
    - Compile and watch for changes with `npm run watch` (no live reloading, no hot module replacement)
  - **Production** mode, featuring best _code optimization_:
    - Compile with `npm run prod`
    - Run development server in production mode: `npm run serve` (not recommended)

- `index.ts` contains
  - Global imports for polyfills
  - Stylesheets `normalize.css` and `global-styles.sass`

- `index.html` contains
  - Charset, language, viewport
  - Roboto font
  - Title, description
  - Meta tags for social media
  - Comment linking to a professional favicon generator
  - Webpack script and stylesheet bundles

- `manifest.json` is a [web app manifest](https://developers.google.com/web/fundamentals/web-app-manifest).
  - You need to insert your app's info.
  - You can set a background and theme color, and make various customizations.
  - You can generate favicons in different sizes [here](https://realfavicongenerator.net/).

## Examples for including frameworks

### React

1. Go to `.tsconfig` and add `"jsx": "react"` to the compilerOptions.
2. Install some dependencies:
   ```bash
   npm install --save react react-dom
   npm install --save-dev @types/react @types/react-dom react-hot-loader
   ```
3. Rename `index.ts` to `index.tsx` and change the `entry` in `webpack.config.js` accordingly
4. Change `index.tsx` like this:
   ```diff
   - document.getElementById('app')!.textContent = 'Hello world!'
   + import * as React from 'react'
   + import * as ReactDOM from 'react-dom'
   +
   + ReactDOM.render(<div>Hello react!</div>, document.getElementById('app'))
   ```

### Bootstrap

1. Add dependencies:
   ```bash
   npm install --save-dev @types/jquery @types/bootstrap
   npm install --save jquery bootstrap
   ```
2. Import in `index.ts`:
   ```ts
   import 'bootstrap'
   import $ from 'jquery'
   ```
3. Replace in `index.sass`:
   ```diff
   - @import "~normalize.css/normalize.css"
   + @import "~bootstrap/dist/css/bootstrap.min.css"
   ```

### Lodash

1. Add dependencies:
   ```bash
   npm install --save-dev @types/lodash
   npm install --save lodash
   ```
2. Import in `index.ts`:
   ```ts
   import _ from 'lodash'
   ```
