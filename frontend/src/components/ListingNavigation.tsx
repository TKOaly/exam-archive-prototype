import React, { FunctionComponent } from 'react'
import classnames from 'classnames'
import Link from 'next/link'
import { motion } from 'framer-motion'

import './ListingNavigation.scss'
import { WithClassName } from './WithClassName'
import { transitions } from './animations'

const ArrowBack: FunctionComponent<WithClassName> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
)

interface BackButtonProps extends WithClassName {
  href: string
  as?: string
}

const BackButton: FunctionComponent<BackButtonProps> = ({
  href,
  as,
  className
}) => (
  <Link href={href} as={as}>
    <a className={classnames('back-button', className)}>
      <ArrowBack className="back-button__icon" />
    </a>
  </Link>
)

interface ListingNavigationProps extends WithClassName {
  title: string
  backButtonHref?: string
  backButtonAs?: string
}

const ListingNavigation: FunctionComponent<ListingNavigationProps> = ({
  title,
  backButtonHref,
  backButtonAs,
  className
}) => (
  <div className={classnames('listing-navigation', className)}>
    <motion.div
      className="listing-navigation__content"
      key="listing-navigation__content"
      variants={{
        initial: {
          opacity: 0
        },
        enter: {
          opacity: 1,
          transition: transitions.in
        },
        exit: {
          opacity: 0,
          transition: transitions.out
        }
      }}
    >
      {backButtonHref && (
        <div className="listing-navigation__button-container">
          <BackButton
            className="listing-navigation__back-button"
            href={backButtonHref}
            as={backButtonAs}
          />
        </div>
      )}
      <div className="listing-navigation__title">
        <span className="listing-navigation__text">{title}</span>
      </div>
    </motion.div>
  </div>
)

export default ListingNavigation
