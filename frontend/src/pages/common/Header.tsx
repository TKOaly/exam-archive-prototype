import React, { FunctionComponent } from 'react'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import UploadIcon from './UploadIcon'
import tkoalyLogo from '../../resources/tkoaly-logo-outline-black-fill-transparent.svg'
import './Header.scss'

export interface Props {
  isShrunk: boolean
  className?: string
}

interface UploadLinkProps {
  to: string
  className?: string
}

const UploadLink: FunctionComponent<UploadLinkProps> = ({ to, className }) => (
  <Link to={to} className={classnames('upload-link', className)}>
    <UploadIcon className="upload-link__icon" />
    <span className="upload-link__text">Submit new</span>
  </Link>
)

const Header: FunctionComponent<Props> = ({ isShrunk, className }) => {
  const classname = classnames('header', className, {
    'header--shrunk': isShrunk
  })

  return (
    <header className={classname}>
      <div className="header__container">
        <Link to="/" className="header__link">
          <img src={tkoalyLogo} alt="TKO-äly logo" className="header__logo" />
        </Link>
        <div className="header__text">
          <h1 className="header__title">Tärpistö</h1>
          <p className="header__subtitle">The TKO-äly ry exam archive</p>
        </div>
        <UploadLink to="/submit" className="header__upload-link" />
      </div>
    </header>
  )
}

export default Header
