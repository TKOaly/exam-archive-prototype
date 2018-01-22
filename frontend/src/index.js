import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import 'normalize.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
