import React from 'react'
import classnames from 'classnames'
import './DocumentList.css'

const DocumentListHeader = () => (
  <div className="document-list-header">
    <p className="document-list-header__document">Document</p>
    <p className="document-list-header__upload-date">Upload date</p>
  </div>
)

const DocumentList = ({ documents, className }) => {
  return (
    <div className={classnames('document-list', className)}>
      <DocumentListHeader />
      <ul className="course-list__list">{items}</ul>
    </div>
  )
}

export default DocumentList
