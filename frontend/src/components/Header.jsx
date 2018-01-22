import React from 'react'
import * as classnames from 'classnames'
import * as tkoalyLogo from '../resources/tkoaly-logo-outline-black-fill-transparent.svg'
import './Header.css'

const Header = ({ className }) => (
  <header className={classnames('header', className)}>
    <div className="header__container">
      <img src={tkoalyLogo} alt="TKO-äly logo" className="header__logo" />
      <h1 className="header__text">Tärpistö</h1>
    </div>
  </header>
)

export default Header
