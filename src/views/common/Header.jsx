const React = require('react')
const classnames = require('classnames')

const Header = ({ className }) => {
  const cls = classnames('header', className)

  return (
    <header className={cls}>
      <div className="header__container">
        <a href="/" className="header__link">
          <img
            src="/static/img/tkoaly-logo-outline-black.svg"
            alt="TKO-äly logo"
            className="header__logo"
          />
        </a>
        <div className="header__text">
          <h1 className="header__title">Tärpistö</h1>
          <p className="header__subtitle">The TKO-äly ry exam archive</p>
        </div>
      </div>
    </header>
  )
}

module.exports = Header
