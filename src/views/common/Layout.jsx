const React = require('react')

const Logo = ({ className }) => (
  <img className={className} src="/static/img/logo-100.png" alt="logo" />
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
        <script defer src="/static/augments.js" />
      </head>
      <body>
        <div className="layout">
          <div className="layout-header">
            <Logo className="layout-header__logo" />
            <h1 className="layout-header__title">Tärpistö</h1>
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
