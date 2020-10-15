const React = require('react')
const Layout = require('./common/Layout')

const ISEPage = () => {
  return (
    <Layout title="Internal Server Error">
      <h1>Internal Server Error</h1>
      <p>An error occurred while authenticating you with the user service.</p>
      <p>
        Please try clearing your cookies and reloading the page, or try again
        later.
      </p>
      <a href="/">Back to listing</a>
    </Layout>
  )
}

module.exports = ISEPage
