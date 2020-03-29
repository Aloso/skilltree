// Import the polyfills you need! Most are in 'core-js/features/'
// Following polyfills are for promises, generators and async-await:
import 'core-js/features/promise'
import 'regenerator-runtime/runtime'

import './main'

// Import stylesheets!
// NOTE: Styles are extracted to a CSS file during the build process.
import './index.sass'

// enable hot reloading for this module:
if (module.hot) module.hot.accept()
