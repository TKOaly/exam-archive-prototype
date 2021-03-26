const React = require('react')
const Layout = require('./common/Layout')
const { ControlsBox, Logout } = require('./common/Controls')

const UnauthorizedPage = ({ flash, username }) => {
  return (
    <Layout flash={flash}>
      <h1>401 - Unauthorized</h1>
      <p>
        <a href="/">Back to listing</a>
      </p>
      <p><a href="https://tko-aly.fi">Back to tko-aly.fi</a></p>

      {username && (
        <div>
          <ControlsBox>
            <Logout username={username} />
          </ControlsBox>
        </div>
      )}
    </Layout>
  )
}

module.exports = UnauthorizedPage
