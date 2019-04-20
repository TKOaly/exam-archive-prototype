export type DocumentId = number
export type CourseId = number

export interface Document {
  id: DocumentId
  courseId: CourseId
  fileName: string
  mimeType: string
  uploadDate: Date
}

export interface Course {
  id: CourseId
  name: string
  /**
   * Timestamp representing the date when this course's latest exam document was
   * uploaded, or `null` if the course has no documents.
   */
  lastModified: Date | null
}
