import { Moment } from 'moment'

export interface Document {
  filename: string
  lastModified?: Moment
  size?: string
}

export interface Course {
  name: string
  documents?: Array<Document>
}
