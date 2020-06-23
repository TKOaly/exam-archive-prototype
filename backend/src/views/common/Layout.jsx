const React = require('react')

const Logo = ({ className }) => (
  <img
    className={className}
    src="https://tarpisto.tko-aly.fi/img/logo-100.png"
    alt="logo"
  />
)

const Layout = ({ children, title, flash }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="robots" content="noindex" />
        <link rel="stylesheet" href="/static/vendor/normalize.css" />
        <link rel="stylesheet" href="/static/main.css" />
        <title>
          {title ? `${title} - Tärpistö - TKO-äly ry` : 'Tärpistö - TKO-äly ry'}
        </title>
      </head>
      <body>
        <div className="layout">
          <div className="layout-header">
            <Logo className="layout-header__logo" />
            Tärpistö
          </div>
          {flash && flash.message}
          {children}
          <div className="layout-footer"></div>
        </div>
      </body>
    </html>
  )
}

module.exports = Layout
