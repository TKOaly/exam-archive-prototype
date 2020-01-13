const React = require('react')
const formatDate = require('date-fns/format')
const fiLocale = require('date-fns/locale/fi')
const Layout = require('./common/Layout')

const ExamTableHeader = () => {
  return (
    <tr className="exam-table-header">
      <th>Name</th>
      <th>Last modified</th>
      <th>Delete</th>
    </tr>
  )
}

const ExamTableRow = ({ exam }) => {
  const { id, courseId, fileName, mimeType, uploadDate, downloadUrl } = exam

  return (
    <tr className="exam-table-row" key={id}>
      <td>
        <img
          className="exam-table__icon"
          src="https://tarpisto.tko-aly.fi/img/pdf.png"
          alt="PDF"
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
    </tr>
  )
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

const ExamTable = ({ exams, previousPageUrl }) => {
  return (
    <table className="exam-table">
      <thead>
        <ExamTableHeader />
      </thead>
      <tbody>
        <GoBackRow href={previousPageUrl} />
        {exams.map(exam => (
          <ExamTableRow key={exam.id} exam={exam} />
        ))}
      </tbody>
    </table>
  )
}

const CoursePage = ({ course, exams, previousPageUrl }) => {
  return (
    <Layout>
      <h2 className="course-page__title">{course.name}</h2>
      <ExamTable exams={exams} previousPageUrl={previousPageUrl} />
    </Layout>
  )
}

module.exports = CoursePage
