const React = require('react')

const Footer = () => {
  return (
    <footer className="layout-footer">
      <div className="layout-footer__text">
        <p>
          Tärpistö - The TKO-äly ry exam archive. Contact:{' '}
          <a href="mailto:tarpisto@tko-aly.fi">tarpisto@tko-aly.fi</a>
        </p>
      </div>
      <div className="layout-footer__links">
        <a rel="noopener" target="_blank" href="https://www.tko-aly.fi/">
          TKO-äly ry
        </a>
        <a
          rel="noopener"
          target="_blank"
          href="https://www.tko-aly.fi/tietosuoja"
        >
          Privacy
        </a>
        <a
          rel="nofollow noopener"
          target="_blank"
          href="https://github.com/TKOaly/exam-archive-new/"
        >
          Source code
        </a>
        <a
          rel="noopener"
          target="_blank"
          href="https://fuksiwiki.tko-aly.fi/T%C3%A4rpist%C3%B6"
        >
          Fuksiwiki
        </a>
      </div>
    </footer>
  )
}

module.exports = Footer
