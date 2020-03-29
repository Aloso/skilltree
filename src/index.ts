// Import the polyfills you need! Most are in 'core-js/features/'
// Following polyfills are for promises, generators and async-await:
import 'core-js/features/promise'
import 'regenerator-runtime/runtime'

// You can import all polyfills at once.
// Note that this is a lot of code, which can increase page load times:
//   import 'core-js'

// You can import modules dynamically:
// import(/* webpackChunkName: "foo" */ './foo').then((foo) => ...)


// Import stylesheets!
// NOTE: Styles are extracted to a CSS file during the build process.
import './index.sass'

// enable hot reloading for this module:
if (module.hot) module.hot.accept()

// Run `npm start` and open localhost:9000, then modify this string:
document.getElementById('app')!.textContent = 'Hello world!'
