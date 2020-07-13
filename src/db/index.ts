import Knex from 'knex'

interface KnexTimestamped {
  created_at: number
  updated_at: number | null
}

export interface DbCourse extends KnexTimestamped {
  id: number
  name: string
}

export interface DbExam extends KnexTimestamped {
  id: number
  course_id: number
  file_name: string
  mime_type: string
  file_path: string
  upload_date: Date
}

// trust the knexfile's contents
type KnexFile = { [env: string]: Knex.Config | undefined }
const knexfile: KnexFile = require('../../knexfile.js')

export const knex = Knex(knexfile[process.env.NODE_ENV!]!)

export const testConnection = async () => {
  await knex('courses').count('id')
}
