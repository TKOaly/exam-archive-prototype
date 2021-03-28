const React = require('react')

const FolderIcon = ({ alt, className, ...props }) => (
  <img
    {...props}
    className={className}
    alt={alt}
    src="/static/img/icon-folder.svg"
  />
)

module.exports = FolderIcon
