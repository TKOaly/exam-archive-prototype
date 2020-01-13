const React = require('react')
const formatDate = require('date-fns/format')
const fiLocale = require('date-fns/locale/fi')
const Layout = require('./common/Layout')

const CourseTableHeader = () => {
  return (
    <tr className="course-table-header">
      <th>Name</th>
      <th>Last modified</th>
      <th>Delete</th>
    </tr>
  )
}

const CourseTableRow = ({ course }) => {
  const { id, name, url, lastModified } = course

  return (
    <tr className="course-table-row" key={id}>
      <td>
        <img
          className="course-table__icon"
          src="https://tarpisto.tko-aly.fi/img/folder_blue.png"
          alt="Course"
        />
        <a className="course-table__link" href={url}>
          {name}
        </a>
      </td>
      <td>
        <time dateTime={lastModified.toISOString()}>
          {formatDate(lastModified, 'yyyy-MM-dd HH:mm', {
            locale: fiLocale
          })}
        </time>
      </td>
    </tr>
  )
}

const CourseTable = ({ courses }) => {
  return (
    <table className="course-table">
      <thead>
        <CourseTableHeader />
      </thead>
      <tbody>
        {courses.map(course => (
          <CourseTableRow key={course.id} course={course} />
        ))}
      </tbody>
    </table>
  )
}

const IndexPage = ({ courses }) => {
  return (
    <Layout>
      <CourseTable courses={courses} />
    </Layout>
  )
}

module.exports = IndexPage
