import { knex, DbExam } from '../db'
import {
  Course,
  CourseListItem,
  ExamListItem,
  CourseId,
  ExamId
} from './common'
import {
  deserializeCourseListItem,
  deserializeCourse,
  deserializeExamListItem
} from './dbDeserializer'

const isNull = (obj: any): obj is null => obj === null
const isNotNull = (obj: any) => !isNull(obj)

const whereNotDeleted = (tableName?: string) => {
  const key = tableName ? `${tableName}.removed_at` : 'removed_at'
  return { [key]: null }
}

export class CourseNotFoundError extends Error {
  constructor(message?: string) {
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    super(message) // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}

export class CannotDeleteError extends Error {
  constructor(message?: string) {
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    super(message) // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}

/**
 * @throws {CourseNotFoundError} if course is not found
 * @throws {CannotDeleteError} if course still has non-deleted exams
 */
export const deleteCourse = async (courseId: CourseId) => {
  const course = await knex('courses')
    .where({ id: courseId, ...whereNotDeleted() })
    .first(['*'])

  if (!course) {
    throw new CourseNotFoundError('Course not found.')
  }

  const nonDeletedExams = parseInt(
    (
      await knex('exams')
        .where({ course_id: courseId, ...whereNotDeleted() })
        .count('id as count')
    )[0].count,
    10
  )

  if (nonDeletedExams > 0) {
    throw new CannotDeleteError('Cannot delete a course with exam documents.')
  }

  await knex('courses')
    .update({ removed_at: knex.fn.now() })
    .where({ id: courseId, ...whereNotDeleted() })
}

export const deleteExam = async (examId: ExamId) =>
  await knex('exams')
    .update({ removed_at: knex.fn.now() })
    .where({ id: examId, ...whereNotDeleted() })

export const renameCourse = async (
  id: CourseId,
  newName: string
): Promise<any> =>
  await knex('courses as course')
    .update({ name: newName })
    .where({ id, ...whereNotDeleted() })

export const getCourseListing = async (): Promise<CourseListItem[]> => {
  const results = await knex('courses as course')
    .leftJoin('exams as exam', function() {
      this.on('exam.course_id', '=', 'course.id').andOnNull('exam.removed_at')
    })
    .select([
      'course.id',
      'course.name',
      knex.raw('max("exam"."upload_date") as "last_modified"')
    ])
    .where({
      ...whereNotDeleted('course')
    })
    .groupBy(['course.id'])

  return results.map(deserializeCourseListItem).filter(isNotNull)
}

export interface CourseInfo extends Course {
  exams: ExamListItem[]
}

export const getCourseInfo = async (
  courseId: number
): Promise<CourseInfo | null> => {
  const courseResult = await knex('courses')
    .where({ id: courseId, ...whereNotDeleted() })
    .first(['courses.*'])

  if (!courseResult) {
    return null
  }

  const examsResult = await knex('exams')
    .select('exams.*')
    .from('exams')
    .where({ course_id: courseId, ...whereNotDeleted() })

  const course = deserializeCourse(courseResult)
  if (!course) {
    return null
  }

  const exams = examsResult.map(deserializeExamListItem).filter(isNotNull)
  return {
    ...course,
    exams
  }
}

export const findCourseByName = async (
  courseName: string
): Promise<Course | null> => {
  const course = await knex('courses')
    .where({ name: courseName, ...whereNotDeleted() })
    .first(['courses.*'])

  if (!course) {
    return null
  }

  return deserializeCourse(course)
}

export const findCourseById = async (
  courseId: CourseId
): Promise<Course | null> => {
  const course = await knex('courses')
    .where({ id: courseId, ...whereNotDeleted() })
    .first(['courses.*'])

  if (!course) {
    return null
  }

  return deserializeCourse(course)
}

export const findCourseByExamId = async (
  examId: ExamId
): Promise<Course | null> => {
  const course = await knex('courses')
    .select('*')
    .where({ ...whereNotDeleted() })
    .whereIn('id', function() {
      this.select('course_id')
        .from('exams')
        .where({ id: examId, ...whereNotDeleted() })
        .first()
    })
    .first()

  if (!course) {
    return null
  }

  return deserializeCourse(course)
}

interface ExamSubmission {
  course_id: number
  file_name: string
  mime_type: string
  file_path: string
}

export const createExam = async (exam: ExamSubmission) => {
  const createdExam = await knex('exams').insert(
    {
      ...exam,
      upload_date: new Date()
    },
    ['exams.*']
  )

  return deserializeExamListItem(createdExam[0])
}

export const findExamById = async (examId: number) => {
  return (await knex('exams')
    .where({ id: examId, ...whereNotDeleted() })
    .first(['exams.*'])) as DbExam
}
