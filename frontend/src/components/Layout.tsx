import React, { FunctionComponent } from 'react'
import Header from './Header'
import './Layout.scss'

const Layout: FunctionComponent = ({ children }) => {
  return (
    <div className="layout">
      <div className="layout__header-spacing" />
      <Header isShrunk={false} className="layout__header" />
      {children}
    </div>
  )
}

export default Layout
