import React from 'react'
import * as classnames from 'classnames'
import './ListingNavigation.css'

const ArrowBack = ({ className }) => (
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

const BackButton = ({ className }) => (
  <button className={classnames('back-button', className)}>
    <ArrowBack className="back-button__icon" />
  </button>
)

const ListingNavigation = ({ title, showBackButton, className }) => (
  <div className={classnames('listing-navigation', className)}>
    <div className="listing-navigation__content">
      {showBackButton && (
        <div className="listing-navigation__button-container">
          <BackButton className="listing-navigation__back-button" />
        </div>
      )}
      <div className="listing-navigation__title">
        <span className="listing-navigation__text">{title}</span>
      </div>
    </div>
  </div>
)

export default ListingNavigation
