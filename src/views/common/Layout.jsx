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
        <link rel="prefetch" href="/static/augments.js" />
        <meta name="viewport" content="width=device-width" />
        <title>
          {title ? `${title} - Tärpistö - TKO-äly ry` : 'Tärpistö - TKO-äly ry'}
        </title>
      </head>
      <body>
        <div className="layout">
          <Header className="layout__header" />
          {children}
        </div>

        <script defer src="/static/augments.js" />
      </body>
    </html>
  )
}

module.exports = Layout
