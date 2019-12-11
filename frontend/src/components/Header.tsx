import React, { FunctionComponent } from 'react'

import classnames from 'classnames'
import Link from 'next/link'
import UploadIcon from './UploadIcon'
import './Header.scss'

export interface Props {
  isShrunk: boolean
  className?: string
}

interface UploadLinkProps {
  href: string
  className?: string
}

const UploadLink: FunctionComponent<UploadLinkProps> = ({
  href,
  className
}) => (
  <Link href={href}>
    <a className={classnames('upload-link', className)}>
      <UploadIcon className="upload-link__icon" />
      <span className="upload-link__text">Submit new</span>
    </a>
  </Link>
)

const Header: FunctionComponent<Props> = ({ isShrunk, className }) => {
  const classname = classnames('header', className, {
    'header--shrunk': isShrunk
  })

  return (
    <header className={classname}>
      <div className="header__container">
        <Link href="/">
          <a className="header__link">
            <img
              src="/img/tkoaly-logo-outline-black-fill-transparent.svg"
              alt="TKO-äly logo"
              className="header__logo"
            />
          </a>
        </Link>
        <div className="header__text">
          <h1 className="header__title">Tärpistö</h1>
          <p className="header__subtitle">The TKO-äly ry exam archive</p>
        </div>
        <UploadLink href="/submit" className="header__upload-link" />
      </div>
    </header>
  )
}

export default Header
