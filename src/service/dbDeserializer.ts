import { Course, CourseListItem, ExamListItem } from './common'

// created_at and uploaded_at are missing because we aren't using them
interface DbCourse {
  id: number
  name: string
}

interface DbCourseListItem extends DbCourse {
  last_modified: Date | null
}

interface DbExamListItem {
  id: number
  course_id: number
  file_name: string
  mime_type: string
  // file_path omitted, not public info
  upload_date: Date
}

type Validation = (obj: any) => boolean

const isTrue = (_: any): _ is true => _ === true

const createValidator = <T>(checks: Validation[]) => (
  obj: any | T
): obj is T => {
  return checks.map(validate => validate(obj)).every(isTrue)
}

const lastModifiedIsNullOrDate = (obj: any) =>
  obj.last_modified === null || obj.last_modified instanceof Date

const courseChecks = [
  (obj: any) => !!obj,
  (obj: any) => typeof obj.id === 'number',
  (obj: any) => typeof obj.name === 'string'
]
const courseListItemChecks = [...courseChecks, lastModifiedIsNullOrDate]
const examChecks = [
  (obj: any) => !!obj,
  (obj: any) => typeof obj.id === 'number',
  (obj: any) => typeof obj.course_id === 'number',
  (obj: any) => typeof obj.file_name === 'string',
  (obj: any) => typeof obj.mime_type === 'string',
  (obj: any) => typeof obj.file_path === 'string',
  (obj: any) => obj.upload_date instanceof Date
]

const isCourse = createValidator<DbCourse>(courseChecks)
const isCourseListItem = createValidator<DbCourseListItem>(courseListItemChecks)
const isExamListItem = createValidator<DbExamListItem>(examChecks)

export const deserializeCourseListItem = (obj: any): CourseListItem | null => {
  if (!isCourseListItem(obj)) {
    return null
  }

  return {
    id: obj.id,
    name: obj.name,
    lastModified: obj.last_modified
  }
}

export const deserializeCourse = (obj: any): Course | null => {
  if (!isCourse(obj)) {
    return null
  }

  const { id, name } = obj
  return { id, name }
}

export const deserializeExamListItem = (obj: any): ExamListItem | null => {
  if (!isExamListItem(obj)) {
    return null
  }

  return {
    id: obj.id,
    courseId: obj.course_id,
    fileName: obj.file_name,
    mimeType: obj.mime_type,
    uploadDate: obj.upload_date
  }
}
