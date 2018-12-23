import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import 'normalize.css'
import App from './components/App'

import * as serviceWorker from './serviceWorker'

ReactDOM.render(<App />, document.getElementById('root'))

// As default behavior, unregister SW
serviceWorker.unregister();
