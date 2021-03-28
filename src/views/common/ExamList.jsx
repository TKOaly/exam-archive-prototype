const React = require('react')
const path = require('path')
const classnames = require('classnames')
const formatDate = require('date-fns/format')
const fiLocale = require('date-fns/locale/fi')

const { useUserContext } = require('./context')

const [DocumentIcon, PdfIcon, PhotoIcon] = [
  '/static/img/icon-document.svg',
  '/static/img/icon-pdf.svg',
  '/static/img/icon-photo.svg'
].map(src => ({ className, ...props }) => {
  return <img {...props} src={src} className={className} />
})

const NoExamsFound = ({ className }) => (
  <p className={classnames('no-exams-found', className)}>No exams found.</p>
)

const iconForFile = mimeType => {
  if (mimeType.startsWith('image/')) {
    return PhotoIcon
  }
  if (mimeType === 'application/pdf') {
    return PdfIcon
  }
  return DocumentIcon
}

const splitExtension = fileName => {
  const extname = path.extname(fileName)
  const basename = path.basename(fileName, extname)

  return { extname, basename }
}

const DeleteExamButton = ({ exam }) => {
  return (
    <form
      className="delete-exam-button"
      method="post"
      action={`/archive/delete-exam/${exam.id}`}
    >
      <button
        className="delete-exam-button__button"
        aria-label={`Delete exam "${exam.fileName}"`}
        title={`Delete exam "${exam.fileName}"`}
        type="submit"
      >
        <img aria-hidden="true" src="/static/img/delete.png" alt="Delete" />
      </button>
    </form>
  )
}

const ExamListItem = ({ exam, showDelete, showRename }) => {
  const { id, fileName, mimeType, uploadDate, downloadUrl } = exam
  const Icon = iconForFile(mimeType)

  const { extname, basename } = splitExtension(fileName)

  return (
    <div role="row" className="exam-list-item">
      <Icon aria-hidden="true" className="exam-list-item__icon" />
      <div role="cell" className="exam-list-item__link-container">
        <a
          href={downloadUrl}
          title={fileName}
          target="_blank"
          className="exam-list-item__link"
        >
          <span className="exam-list-item__basename">{basename}</span>
          <span className="exam-list-item__extname">{extname}</span>
        </a>
      </div>
      <div role="cell" className="exam-list-item__last-modified">
        {uploadDate && (
          <time
            title={uploadDate.toISOString()}
            dateTime={uploadDate.toISOString()}
          >
            {formatDate(uploadDate, 'yyyy-MM-dd', { locale: fiLocale })}
          </time>
        )}
      </div>
      {showDelete && (
        <div role="cell" className="exam-list-item__delete">
          <DeleteExamButton exam={exam} />
        </div>
      )}
      {showRename && (
        <div role="cell" className="exam-list-item__rename">
          <button
            /* augments.js */
            data-current-name={fileName}
            data-id={id}
            className="exam-list-item__rename-button"
          >
            rename
          </button>
        </div>
      )}
    </div>
  )
}

const ExamListHeader = ({ showDelete, showRename }) => {
  return (
    <div role="row" className="exam-list-header">
      <div role="columnheader" className="exam-list-header__name">
        Exam
      </div>
      <div role="columnheader" className="exam-list-header__last-modified">
        Upload date
      </div>
      {showDelete && <div role="columnheader" aria-label="Delete" />}
      {showRename && (
        <div
          role="columnheader"
          aria-label="Rename"
          className="exam-list-header__rename"
        />
      )}
    </div>
  )
}

const ExamList = ({ exams, className }) => {
  const { canDelete, canRename } = useUserContext()

  if (exams.length === 0) {
    return (
      <div className={classes}>
        <NoExamsFound className="exam-list__not-found" />
      </div>
    )
  }

  return (
    <div className="exam-list-container">
      <div
        role="table"
        aria-label="Exams"
        className={classnames('exam-list', className)}
      >
        <ExamListHeader showDelete={canDelete} showRename={canRename} />
        {exams.map(exam => (
          <ExamListItem
            key={exam.id}
            exam={exam}
            showDelete={canDelete}
            showRename={canRename}
          />
        ))}
      </div>
    </div>
  )
}

module.exports = ExamList
