import { knex, DbExam } from '../db'
import { Course, CourseListItem, ExamListItem, CourseId } from './common'
import {
  deserializeCourseListItem,
  deserializeCourse,
  deserializeExamListItem
} from './dbDeserializer'

const isNull = (obj: any): obj is null => obj === null
const isNotNull = (obj: any) => !isNull(obj)

export const renameCourse = async (
  id: CourseId,
  newName: string
): Promise<any> =>
  await knex('courses as course')
    .update({ name: newName })
    .where({ id })

export const getCourseListing = async (): Promise<CourseListItem[]> => {
  const results = await knex('courses as course')
    .leftJoin('exams as exam', function() {
      this.on('exam.course_id', '=', 'course.id')
    })
    .select([
      'course.id',
      'course.name',
      knex.raw('max("exam"."upload_date") as "last_modified"')
    ])
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
    .where({ id: courseId })
    .first(['courses.*'])

  if (!courseResult) {
    return null
  }

  const examsResult = await knex('exams')
    .select('exams.*')
    .from('exams')
    .where({ course_id: courseId })

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

export const findCourseById = async (
  courseId: CourseId
): Promise<Course | null> => {
  const course = await knex('courses')
    .where({ id: courseId })
    .first(['courses.*'])

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
    .where({ id: examId })
    .first(['exams.*'])) as DbExam
}
