const React = require('react')
const Header = require('./Header')

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
          <Header className="layout__header" />
          {flash && flash.message}
          {children}
        </div>
      </body>
    </html>
  )
}

module.exports = Layout