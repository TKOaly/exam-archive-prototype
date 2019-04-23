import { knex } from '../db'
import { Course, CourseListItem, ExamListItem } from './common'
import {
  deserializeCourseListItem,
  deserializeCourse,
  deserializeExamListItem
} from './dbDeserializer'

const isNull = (obj: any): obj is null => obj === null
const isNotNull = (obj: any) => !isNull(obj)

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
