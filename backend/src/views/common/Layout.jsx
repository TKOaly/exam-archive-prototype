const React = require('react')

const Logo = ({ className }) => (
  <img
    className={className}
    src="https://tarpisto.tko-aly.fi/img/logo-100.png"
    alt="logo"
  />
)

const Layout = ({ children, title }) => {
  return (
    <html>
      <head>
        <title>
          {title ? `${title} - Tärpistö - TKO-äly ry` : 'Tärpistö - TKO-äly ry'}
        </title>
        <link rel="stylesheet" href="/static/main.css" />
      </head>
      <body>
        <div className="layout">
          <div className="layout-header">
            <Logo className="layout-header__logo" />
            Tärpistö
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}

module.exports = Layout
