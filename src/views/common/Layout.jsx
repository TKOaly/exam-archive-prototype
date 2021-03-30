const React = require('react')
const Header = require('./Header')

const Layout = ({ children, title }) => {
  return (
    <html lang="en">
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
      <body data-instant-whitelist>
        <div className="layout">
          <Header className="layout__header" />
          {children}
        </div>

        <script defer src="/static/augments.js" />
        <script defer src="/static/vendor/instantpage-5.1.0.js" />
      </body>
    </html>
  )
}

module.exports = Layout
