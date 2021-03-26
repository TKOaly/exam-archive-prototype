import { knex } from '../db'

export const devGetS3Objects = async (): Promise<
  { id: number; file_name: string; file_path: string }[]
> => {
  return knex('exams')
    .select(['id', 'file_name', 'file_path'])
    .orderBy('file_path', 'asc')
}

export const devApplyDevS3ExamPrefix = async (
  devPrefix: string
): Promise<void> => {
  await knex.raw(`UPDATE exams SET file_path = ? || '/' || file_path`, [
    devPrefix
  ])
}

export const devRemoveS3ExamPrefix = async () => {
  await knex.raw(
    `UPDATE exams SET file_path = regexp_replace(file_path, '^[^/]+/', '', 'g')`
  )
}
