const React = require('react')
const classnames = require('classnames')

const ArrowBack = ({ className, ...props }) => (
  <svg
    {...props}
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

const BackButton = ({ href, className }) => (
  <a
    data-instant
    href={href}
    aria-label="Back to course listing"
    className={classnames('back-button', className)}
  >
    <ArrowBack className="back-button__icon" alt="Arrow pointing to the left" />
  </a>
)

const ListingNavigation = ({
  title,
  backButtonLabel,
  backButtonHref,
  className
}) => (
  <div className={classnames('listing-navigation', className)}>
    <div className="listing-navigation__content">
      {backButtonHref && (
        <nav className="listing-navigation__button-container">
          <BackButton
            className="listing-navigation__back-button"
            href={backButtonHref}
            label={backButtonLabel}
          />
        </nav>
      )}
      <div className="listing-navigation__title">
        <h2 className="listing-navigation__text">{title}</h2>
      </div>
    </div>
  </div>
)

module.exports = ListingNavigation
