const React = require('react')
const PropTypes = require('prop-types')
const formatDate = require('date-fns/format')
const fiLocale = require('date-fns/locale/fi')
const Layout = require('./common/Layout')
const { ControlsBox, Logout } = require('./common/Controls')

const ExamTableHeader = ({ showDelete }) => {
  return (
    <tr className="exam-table-header">
      <th>Name</th>
      <th>Last modified</th>
      {showDelete && <th>Delete</th>}
    </tr>
  )
}

ExamTableHeader.propTypes = {
  showDelete: PropTypes.bool
}

const mimeTypeImage = mimeType => {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf.png'
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
      return 'image.png'
    case 'text/html':
    case 'text/plain':
    case 'text/markdown':
      return 'txt.png'
    default:
      return 'unknown.png'
  }
}

const DeleteExamButton = ({ action }) => {
  return (
    <form className="delete-exam-button" method="post" action={action}>
      <button
        className="delete-exam-button__button"
        aria-label="Delete exam"
        type="submit"
      >
        <img src="/static/img/delete.png" alt="Delete" />
      </button>
    </form>
  )
}

DeleteExamButton.propTypes = {
  action: PropTypes.string.isRequired
}

const makeDeleteExamAction = examId => `/archive/delete-exam/${examId}`

const ExamTableRow = ({ exam, showDelete }) => {
  const { id, fileName, mimeType, uploadDate, downloadUrl } = exam

  return (
    <tr className="exam-table-row" key={id}>
      <td>
        <img
          className="exam-table__icon"
          src={`/static/img/filetypes/${mimeTypeImage(mimeType)}`}
          alt="Icon"
        />
        <a className="exam-table__link" href={downloadUrl}>
          {fileName}
        </a>
      </td>
      <td>
        <time dateTime={uploadDate.toISOString()}>
          {formatDate(uploadDate, 'yyyy-MM-dd HH:mm', {
            locale: fiLocale
          })}
        </time>
      </td>
      {showDelete && (
        <td className="exam-table-row__delete">
          <DeleteExamButton action={makeDeleteExamAction(id)} />
        </td>
      )}
    </tr>
  )
}

const examShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  fileName: PropTypes.string.isRequired,
  uploadDate: PropTypes.instanceOf(Date).isRequired,
  downloadUrl: PropTypes.string.isRequired
})

ExamTableRow.propTypes = {
  exam: examShape.isRequired,
  showDelete: PropTypes.bool
}

const GoBackRow = ({ href }) => {
  return (
    <tr className="exam-table-row">
      <td>
        <img
          className="exam-table__icon"
          src="https://tarpisto.tko-aly.fi/img/up.png"
          alt="Go back"
        />
        <a href={href}>Parent Directory</a>
      </td>
    </tr>
  )
}

GoBackRow.propTypes = {
  href: PropTypes.string.isRequired
}

const ExamTable = ({ exams, previousPageUrl, showDelete }) => {
  return (
    <table className="exam-table">
      <thead>
        <ExamTableHeader showDelete={showDelete} />
      </thead>
      <tbody>
        <GoBackRow href={previousPageUrl} />
        {exams.map(exam => (
          <ExamTableRow key={exam.id} exam={exam} showDelete={showDelete} />
        ))}
      </tbody>
    </table>
  )
}

ExamTable.propTypes = {
  exams: PropTypes.arrayOf(examShape.isRequired).isRequired,
  previousPageUrl: PropTypes.string.isRequired,
  showDelete: PropTypes.bool
}

const UploadExamForm = () => {
  return (
    <form
      className="exam-upload-form"
      method="post"
      encType="multipart/form-data"
    >
      <h3>Upload a new file here:</h3>
      <input
        className="exam-upload-form__file"
        required
        aria-label="File"
        type="file"
        name="file"
      />
      <input
        className="exam-upload-form__submit"
        type="submit"
        name="upload"
        value="Upload"
      />
    </form>
  )
}

const CoursePage = ({
  course,
  exams,
  previousPageUrl,
  username,
  userRights
}) => {
  return (
    <Layout>
      <h2 className="course-page__title">{course.name}</h2>
      <ExamTable
        exams={exams}
        previousPageUrl={previousPageUrl}
        showDelete={userRights.remove}
      />

      <ControlsBox>
        {userRights.upload && <UploadExamForm />}
        <Logout username={username} />
      </ControlsBox>
    </Layout>
  )
}

module.exports = CoursePage
