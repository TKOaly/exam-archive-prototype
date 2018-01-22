import React from 'react'
import * as classnames from 'classnames'
import * as tkoalyLogo from '../resources/tkoaly-logo-outline-black-fill-transparent.svg'
import './Header.css'

const Header = ({ isShrunk, className }) => {
  const classname = classnames('header', className, {
    'header--shrunk': isShrunk
  })

  return (
    <header className={classname}>
      <div className="header__container">
        <img src={tkoalyLogo} alt="TKO-äly logo" className="header__logo" />
        <div className="header__text">
          <h1 className="header__title">Tärpistö</h1>
          <p className="header__subtitle">The TKO-äly ry exam archive</p>
        </div>
      </div>
    </header>
  )
}

export default Header
