import React, { FunctionComponent } from 'react'
import Header from './Header'
import './App.scss'
import './index.scss'
import 'normalize.css'

const Layout: FunctionComponent = ({ children }) => {
  return (
    <div className="app">
      <div className="app__header-spacing" />
      <Header isShrunk={false} className="app__header" />
      {children}
    </div>
  )
}

export default Layout
