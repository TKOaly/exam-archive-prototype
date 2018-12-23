import React from 'react'
import moment, { Moment } from 'moment'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import './CourseList.scss'
import { Icon } from './Icon'
import { Document, Course } from '../domain'
import { WithClassName } from './WithClassName'

const FolderIcon: Icon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className={classnames('folder-icon', className)}
  >
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
)

interface ListingAlphabetProps {
  letter: string
}

const ListingAlphabet: React.SFC<ListingAlphabetProps> = ({ letter }) => (
  <p className="listing-alphabet">{letter}</p>
)

interface CourseListItemProps extends WithClassName {
  name: string
  lastModified: Moment | null
}
const CourseListItem: React.SFC<CourseListItemProps> = ({
  name,
  lastModified,
  children
}) => {
  return (
    <li className="course-list-item">
      <FolderIcon className="course-list-item__icon" />
      <Link
        to={`/courses/${encodeURI(name)}`}
        className="course-list-item__link"
        title={name}
      >
        <span className="course-list-item__name">{name}</span>
      </Link>
      <p className="course-list-item__last-modified">
        {lastModified && lastModified.format('YYYY-MM-DD hh:mm')}
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

function isNotNil<A>(a: A | undefined): a is A {
  return !Object.is(a, undefined)
}

const findLatestModifiedDate = (documents: Array<Document> | undefined) => {
  if (!documents) return null
  const documentsTimestamps = documents
    .map(_ => _.lastModified)
    .filter(isNotNil)
  return moment.max(documentsTimestamps)
}

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

const CourseList: React.SFC<CourseListProps> = ({ courses, className }) => {
  const firstNamesOfStartingLetter = findFirstNamesOfStartingLetter(
    courses.map(_ => _.name)
  )
  const shouldShowAlphabet = (courseName: string) =>
    firstNamesOfStartingLetter.has(courseName)

  const items = courses.map(course => (
    <CourseListItem
      className="course-list__course-list-item"
      key={course.name}
      name={course.name}
      lastModified={findLatestModifiedDate(course.documents)}
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
