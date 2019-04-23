export type CourseId = number

export interface Course {
  id: CourseId
  name: string
}

export interface CourseListItem extends Course {
  /**
   * Timestamp representing the date when this course's latest exam was
   * uploaded.
   */
  lastModified: Date | null
}

export interface ExamListItem {
  id: number
  courseId: number
  fileName: string
  mimeType: string
  uploadDate: Date
}
