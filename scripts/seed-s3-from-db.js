require('dotenv').config()
const Knex = require('knex')
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const { transliterate } = require('transliteration')
const contentDisposition = require('content-disposition')
const knexfile = require('../knexfile')
const knex = Knex(knexfile[process.env.NODE_ENV])

const chunk = (arr, len) => {
  const chunks = []
  const n = arr.length

  let i = 0
  while (i < n) {
    chunks.push(arr.slice(i, (i += len)))
  }

  return chunks
}

const start = async () => {
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })

  const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

  const exams = await knex('exams').select('*')
  let i = 0
  for (const examChunk of chunk(exams, 8)) {
    await Promise.all(
      examChunk.map(async exam => {
        console.log(`Uploading ${i++}/${exams.length}: `, {
          Key: exam.file_path,
          ContentType: exam.mime_type,
          ContentDisposition: contentDisposition(exam.file_name, {
            type: 'inline',
            fallback: transliterate(exam.file_name)
          })
        })
        const filePath = path.join(process.env.ARCHIVE_FILE_DIR, exam.file_path)
        await s3
          .upload({
            Bucket: process.env.AWS_S3_BUCKET_ID,
            Key: exam.file_path,
            ContentType: exam.mime_type,
            ContentDisposition: contentDisposition(exam.file_name, {
              type: 'inline',
              fallback: transliterate(exam.file_name)
            }),
            Body: fs.createReadStream(filePath)
          })
          .promise()
      })
    )
  }
  console.log('Uploaded all')
}

start()
  .then(() => {
    console.log('done')
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
