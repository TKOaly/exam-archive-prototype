const React = require('react')
const Layout = require('./common/Layout')

const NotFoundPage = () => {
  return (
    <Layout>
      <h1>404 - Not Found</h1>
      <a href="/">Back to listing</a>
    </Layout>
  )
}

module.exports = NotFoundPage
