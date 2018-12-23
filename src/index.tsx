import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import 'normalize.css'
import App from './components/App'

// @ts-ignore Allow registerServiceWorker.js to be javascript for now
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
