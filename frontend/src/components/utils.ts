import { generateCourseSlug } from './slug'

export const hrefToCourse = (courseId: number | string, courseName: string) =>
  `/courses/${courseId}-${encodeURI(generateCourseSlug(courseName))}`
