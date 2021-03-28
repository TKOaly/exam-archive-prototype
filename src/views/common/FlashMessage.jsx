const React = require('react')
const classnames = require('classnames')

const FlashMessage = ({ flash: { message, type } }) => {
  type = type || 'info'
  return (
    <div
      role="alert"
      className={classnames('flash-message', `flash-message--${type}`)}
    >
      {message}
    </div>
  )
}

const FlashContainer = ({ flash }) =>
  flash && flash.message ? <FlashMessage flash={flash} /> : null

module.exports = FlashContainer
