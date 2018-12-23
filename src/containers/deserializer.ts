import { Document, Course } from '../domain'
import moment from 'moment'

// #region Domain type representations before deserialization
interface DocumentRepr {
  filename: string
  lastModified?: string
  size?: string
}

interface CourseRepr {
  name: string
  documents?: Array<DocumentRepr>
}
// #endregion

const momentifyLastModified = (document: DocumentRepr): Document => {
  return {
    ...document,
    lastModified: moment(document.lastModified)
  }
}

export const deserialize = (courses: Array<CourseRepr>): Array<Course> => {
  const appModelCourses = courses.map(course => ({
    ...course,
    documents: course.documents
      ? course.documents.map(momentifyLastModified)
      : undefined
  }))
  appModelCourses.sort((a, b) => a.name.localeCompare(b.name))
  return appModelCourses
}
