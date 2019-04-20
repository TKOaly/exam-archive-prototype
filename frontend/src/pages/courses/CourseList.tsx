import React, { FunctionComponent } from 'react'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import formatDate from 'date-fns/format'
import slugify from 'slugify'
import './CourseList.scss'
import FolderIcon from './FolderIcon'
import { WithClassName } from '../common/WithClassName'
import { Course } from '../../domain'

const generateCourseSlug = (courseName: string) => {
  return slugify(courseName.replace(/c\+\+/i, 'cpp'), {
    lower: true,
    replacement: '-',
    remove: /[^\w\d \-]/g
  })
}

const hrefToCourse = (courseId: number | string, courseName: string) =>
  `/courses/${courseId}-${encodeURI(generateCourseSlug(courseName))}`

interface ListingAlphabetProps {
  letter: string
}

const ListingAlphabet: FunctionComponent<ListingAlphabetProps> = ({
  letter
}) => <p className="listing-alphabet">{letter}</p>

interface CourseListItemProps {
  id: number
  name: string
  lastModified: Date | null
}

const CourseListItem: FunctionComponent<CourseListItemProps> = ({
  id,
  name,
  lastModified,
  children
}) => {
  return (
    <li className="course-list-item">
      <FolderIcon className="course-list-item__icon" />
      <Link
        to={hrefToCourse(id, name)}
        className="course-list-item__link"
        title={name}
      >
        <span className="course-list-item__name">{name}</span>
      </Link>
      <p className="course-list-item__last-modified">
        {lastModified && formatDate(lastModified, 'YYYY-MM-DD hh:mm')}
      </p>
      {children}
    </li>
  )
}

const CourseListHeader = () => (
  <div className="course-list-header">
    <p className="course-list-header__name">Course</p>
    <p className="course-list-header__last-modified">Last modified</p>
  </div>
)

function findFirstNamesOfStartingLetter(courseNames: Array<string>) {
  const firstNames = new Set<string>()
  let previous = courseNames[0].charAt(0)
  firstNames.add(courseNames[0])

  for (const courseName of courseNames) {
    const startingLetter = courseName.charAt(0)
    if (startingLetter === previous) continue
    previous = startingLetter
    firstNames.add(courseName)
  }

  return firstNames
}

interface CourseListProps extends WithClassName {
  courses: Array<Course>
}

const CourseList: FunctionComponent<CourseListProps> = ({
  courses,
  className
}) => {
  const sortedCourses = [...courses].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const firstNamesOfStartingLetter =
    sortedCourses.length > 0
      ? findFirstNamesOfStartingLetter(sortedCourses.map(_ => _.name))
      : new Set<string>()

  const shouldShowAlphabet = (courseName: string) =>
    firstNamesOfStartingLetter.has(courseName)

  const items = sortedCourses.map(course => (
    <CourseListItem
      key={course.id}
      id={course.id}
      name={course.name}
      lastModified={course.lastModified}
    >
      {/* Show alphabets to the left of the listing */
      shouldShowAlphabet(course.name) ? (
        <ListingAlphabet letter={course.name.charAt(0).toLocaleUpperCase()} />
      ) : null}
    </CourseListItem>
  ))

  return (
    <div className={classnames('course-list', className)}>
      <CourseListHeader />
      <ul className="course-list__list">{items}</ul>
    </div>
  )
}

export default CourseList
