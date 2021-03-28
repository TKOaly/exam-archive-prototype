const React = require('react')
const Layout = require('./common/Layout')
const Footer = require('./common/Footer')
const { ControlsBox, Logout } = require('./common/Controls')

const NotFoundPage = ({ flash, username }) => {
  return (
    <Layout flash={flash}>
      <div className="page-container">
        <main>
          <h1>404 - Not Found</h1>
          <a href="/">Back to listing</a>

          {username && (
            <div>
              <ControlsBox>
                <Logout username={username} />
              </ControlsBox>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </Layout>
  )
}

module.exports = NotFoundPage
