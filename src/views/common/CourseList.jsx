const React = require('react')
const classnames = require('classnames')
const formatDate = require('date-fns/format')
const fiLocale = require('date-fns/locale/fi')

const { useUserContext } = require('./context')
const FolderIcon = require('./FolderIcon')

const MenuButton = ({ onClick, className }) => {
  return (
    <button
      className={classnames('menu-button', className)}
      onClick={onClick}
    ></button>
  )
}

const CourseListItem = ({
  name,
  url,
  lastModified,
  showDelete,
  showRename
}) => {
  const showMenu = showDelete || showRename

  return (
    <div role="row" className="course-list-item">
      <FolderIcon aria-hidden="true" className="course-list-item__icon" />
      <div
        role="cell"
        aria-colindex="1"
        className="course-list-item__link-container"
      >
        <a href={url} title={name} className="course-list-item__link">
          {name}
        </a>
      </div>
      <div
        className="course-list-item__last-modified"
        role="cell"
        aria-colindex="2"
      >
        {lastModified && (
          <time dateTime={lastModified.toISOString()}>
            {formatDate(lastModified, 'yyyy-MM-dd', { locale: fiLocale })}
          </time>
        )}
      </div>
      {showMenu && (
        <div
          className="course-list-item__menu"
          role="cell"
          aria-colindex="3"
        ></div>
      )}
    </div>
  )
}

const CourseListHeader = ({ showDelete, showRename }) => {
  const showMenu = showDelete || showRename

  return (
    <div role="row" className="course-list-header">
      <div
        role="columnheader"
        aria-colindex="1"
        className="course-list-header__name"
      >
        Course
      </div>
      <div
        role="columnheader"
        aria-colindex="2"
        className="course-list-header__last-modified"
      >
        Last modified
      </div>
      {showMenu && (
        <div
          role="columnheader"
          aria-colindex="3"
          className="course-list-header__controls"
          aria-label="Options"
        ></div>
      )}
    </div>
  )
}

const CourseList = ({ courses }) => {
  const { canDelete, canRename } = useUserContext()
  const rowCount = courses.length + 1 // +1 for header

  return (
    <div
      role="table"
      aria-label="Courses"
      //aria-rowcount={rowCount}
      //aria-colcount="2"
      className="course-list"
    >
      <CourseListHeader showDelete={canDelete} showRename={canRename} />
      {courses.map(course => {
        return (
          <CourseListItem
            key={course.id}
            name={course.name}
            url={course.url}
            lastModified={course.lastModified}
            showDelete={canDelete}
            showRename={canRename}
          />
        )
      })}
    </div>
  )
}

module.exports = CourseList
