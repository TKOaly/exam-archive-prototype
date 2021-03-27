const React = require('react')
const PropTypes = require('prop-types')
const formatDate = require('date-fns/format')
const fiLocale = require('date-fns/locale/fi')

const Layout = require('./common/Layout')
const ListingNavigation = require('./common/ListingNavigation')
const { ControlsBox, Logout } = require('./common/Controls')

const CourseTableHeader = ({ showDelete, showRename }) => {
  return (
    <tr className="course-table-header">
      <th>Name</th>
      <th>Last modified</th>
      {showDelete && <th>Delete</th>}
      {showRename && <th>Rename</th>}
    </tr>
  )
}

CourseTableHeader.propTypes = {
  showDelete: PropTypes.bool,
  showRename: PropTypes.bool
}

const DeleteCourseButton = ({ action }) => {
  return (
    <form className="delete-course-button" method="post" action={action}>
      <button
        className="delete-course-button__button"
        aria-label="Delete course"
        type="submit"
      >
        <img src="/static/img/delete.png" alt="Delete" />
      </button>
    </form>
  )
}

DeleteCourseButton.propTypes = {
  action: PropTypes.string.isRequired
}

const makeDeleteCourseAction = courseId => `/archive/delete-course/${courseId}`

const CourseTableRow = ({ course, showDelete, showRename }) => {
  const { id, name, url, lastModified } = course

  return (
    <tr className="course-table-row" key={id}>
      <td>
        <img
          className="course-table__icon"
          src="/static/img/folder_blue.png"
          alt="Course"
        />
        <a className="course-table__link" href={url}>
          {name}
        </a>
      </td>
      <td>
        {lastModified && (
          <time dateTime={lastModified.toISOString()}>
            {formatDate(lastModified, 'yyyy-MM-dd HH:mm', {
              locale: fiLocale
            })}
          </time>
        )}
      </td>
      {showDelete && (
        <td className="course-table-row__delete">
          <DeleteCourseButton action={makeDeleteCourseAction(id)} />
        </td>
      )}
      {showRename && (
        <td className="course-table-row__rename">
          <button
            /* augments.js */
            data-current-name={name}
            data-id={id}
            className="course-table-row__rename-button"
          >
            rename
          </button>
        </td>
      )}
    </tr>
  )
}

const courseShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  lastModified: PropTypes.instanceOf(Date)
})

CourseTableRow.propTypes = {
  course: courseShape.isRequired,
  showDelete: PropTypes.bool,
  showRename: PropTypes.bool
}

const CourseTable = ({ courses, showDelete, showRename }) => {
  return (
    <table className="course-table">
      <thead>
        <CourseTableHeader showDelete={showDelete} showRename={showRename} />
      </thead>
      <tbody>
        {courses.map(course => (
          <CourseTableRow
            key={course.id}
            showDelete={showDelete}
            showRename={showRename}
            course={course}
          />
        ))}
      </tbody>
    </table>
  )
}

CourseTable.propTypes = {
  showDelete: PropTypes.bool.isRequired,
  showRename: PropTypes.bool.isRequired,
  courses: PropTypes.arrayOf(courseShape.isRequired).isRequired
}

const CreateCourseForm = () => {
  return (
    <form className="create-course-form" method="post">
      <h3>Add a new course:</h3>
      <input
        className="create-course-form__name"
        required
        aria-label="Course name"
        placeholder="Course name"
        type="text"
        name="courseName"
      ></input>
      <input
        className="create-course-form__submit"
        type="submit"
        name="create"
        value="Create course"
      />
    </form>
  )
}

const IndexPage = ({ flash, courses, username, userRights }) => {
  return (
    <Layout flash={flash}>
      <ListingNavigation title="Courses" />
      <main className="course-list-page">
        <CourseTable
          courses={courses}
          showDelete={userRights.remove}
          showRename={userRights.rename}
        />
        <ControlsBox>
          {userRights.upload && <CreateCourseForm />}
          <Logout username={username} />
        </ControlsBox>
      </main>
    </Layout>
  )
}

module.exports = IndexPage
