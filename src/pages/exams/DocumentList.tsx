import React, { FunctionComponent } from 'react'
import classnames from 'classnames'
import formatDate from 'date-fns/format'
import './DocumentList.scss'
import { WithClassName } from '../common/WithClassName'
import { DocumentIcon, PdfIcon, PhotoIcon } from '../common/FileIcons'
import { Document, DetailedCourse } from '../../domain'

const DocumentListHeader = () => (
  <div className="document-list-header">
    <p className="document-list-header__document">Document</p>
    <p className="document-list-header__upload-date">Upload date</p>
  </div>
)

const NoDocumentsFound: FunctionComponent<WithClassName> = ({ className }) => (
  <p className={classnames('no-documents-found', className)}>
    No documents found
  </p>
)

// todo: just return BEM modifier and set the background image with CSS
const iconForFile = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return (
      <PhotoIcon className="document-list-item__icon document-list-item__icon--is-photo" />
    )
  }

  if (mimeType === 'application/pdf') {
    return (
      <PdfIcon className="document-list-item__icon document-list-item__icon--is-pdf" />
    )
  }

  return (
    <DocumentIcon className="document-list-item__icon document-list-item__icon--is-generic" />
  )
}

interface DocumentListItemProps {
  href: string
  fileName: string
  mimeType: string
  uploadDate: Date
}

const DocumentListItem: FunctionComponent<DocumentListItemProps> = ({
  href,
  fileName,
  mimeType,
  uploadDate
}) => {
  const icon = iconForFile(mimeType)

  return (
    <li className="document-list-item">
      {icon}
      <a href={href} target="_self" className="document-list-item__link">
        <span className="document-list-item__filename">{fileName}</span>
      </a>
      <p className="document-list-item__last-modified">
        {uploadDate && formatDate(uploadDate, 'YYYY-MM-DD hh:mm')}
      </p>
    </li>
  )
}

const downloadLink = (examId: number, fileName: string) => {
  const encodedExamId = encodeURIComponent(`${examId}`)
  const encodedFileName = encodeURIComponent(fileName)
  return `/download/${encodedExamId}/${encodedFileName}`
}

interface DocumentListProps extends WithClassName {
  documents: Document[]
  isLoading: boolean
}

const DocumentList: FunctionComponent<DocumentListProps> = ({
  documents,
  isLoading,
  className
}) => {
  const classes = classnames('document-list', className)

  if (!isLoading && documents.length === 0) {
    return (
      <div className={classes}>
        <NoDocumentsFound className="document-list__not-found" />
      </div>
    )
  }

  const content = isLoading ? (
    <li>Loading...</li>
  ) : (
    documents.map(({ id, fileName, mimeType, uploadDate }) => (
      <DocumentListItem
        key={id}
        href={downloadLink(id, fileName)}
        fileName={fileName}
        mimeType={mimeType}
        uploadDate={uploadDate}
      />
    ))
  )

  return (
    <div className={classes}>
      <DocumentListHeader />
      <ul className="document-list__list">{content}</ul>
    </div>
  )
}

export default DocumentList
