// @ts-check
/// <reference lib="es2017" />

const path = require('path')
const util = require('util')
const fs = require('fs')
const mime = require('mime')
const flatten = require('lodash/flatten')
const dateMin = require('date-fns/min')
const Knex = require('knex')
const uuid = require('uuid/v4')
const knexfile = require('../knexfile')

const statAsync = util.promisify(fs.stat)
const readdirAsync = util.promisify(fs.readdir)
const copyFileAsync = util.promisify(fs.copyFile)

const knex = Knex(knexfile[process.env.NODE_ENV])
const ARCHIVE_FILE_DIR = process.env.ARCHIVE_FILE_DIR

/**
 * @param {string} dirPath
 * @typedef {import("fs").Stats} Stats
 * @typedef {{name: string, path: string, stats: Stats}} DirEntry
 * @returns {Promise<DirEntry[]>}
 */
const readDir = async dirPath => {
  const dirContent = await readdirAsync(dirPath)

  const dirs = await Promise.all(
    dirContent.map(async dirName => {
      const fullPath = path.join(dirPath, dirName)
      const stats = await statAsync(fullPath)
      return {
        name: dirName,
        path: fullPath,
        stats
      }
    })
  )

  return dirs
}

/**
 * @param {string} dirPath
 * @returns {Promise<DirEntry[]>}
 */
const readSubdirs = async dirPath => {
  const entries = await readDir(dirPath)
  return entries.filter(({ stats }) => stats.isDirectory())
}

const readFiles = async dirPath => {
  const entries = await readDir(dirPath)
  return entries.filter(({ stats }) => stats.isFile())
}

const idGen = new class IdGen {
  constructor() {
    this.nextCourseId = 0
    this.nextExamId = 0
    this.getNextCourseId = this.getNextCourseId.bind(this)
    this.getNextExamId = this.getNextExamId.bind(this)
  }
  getNextCourseId() {
    return this.nextCourseId++
  }
  getNextExamId() {
    return this.nextExamId++
  }
}()

/**
 * @param {DirEntry} dirEntry
 */
const addDirId = dirEntry => ({
  ...dirEntry,
  id: idGen.getNextCourseId()
})

const getFileExt = filename => path.extname(filename).replace(/\./g, '')
const getMimeType = filename => mime.getType(getFileExt(filename))

const printHelp = () => {
  console.log(`Seeds the backend's database from the old exam archive's file`)
  console.log('archive.')
  console.log('')
  console.log('USAGE:   node seed-db-from-files.js <path>')
  console.log('')
  console.log(`Pass the path to the old archive's files directory with <path>.`)
  console.log('')
}

const generateFilename = (courseId, examId, mimeType) => {
  const guid = uuid()
  const ext = mime.getExtension(mimeType)
  return `${courseId}_${examId}_${guid}.${ext}`
}

const start = async sourceDirectory => {
  // Deletes ALL existing entries
  //await knex('courses').del()

  console.log('Reading courses...')
  const courses = (await readSubdirs(sourceDirectory)).map(addDirId)
  const courseObjects = courses.map(({ id, name }) => ({ id, name }))

  console.log('Inserting courses to db...')
  await knex.batchInsert('courses', courseObjects, 30)

  console.log('Reading exam documents...')
  const fileObjectLists = await Promise.all(
    courses.map(async ({ id: courseId, path: courseDirPath }) => {
      const files = await readFiles(courseDirPath)

      return files.map(
        ({ name: fileName, path: filePath, stats: fileStats }) => ({
          id: idGen.getNextExamId(),
          course_id: courseId,
          file_name: fileName,
          mime_type: getMimeType(fileName) || 'application/octet-stream',
          file_path: filePath,
          upload_date: dateMin(fileStats.ctime, fileStats.mtime)
        })
      )
    })
  )
  const sourceFileObjects = flatten(fileObjectLists)
  console.log('sourceFileObjects', JSON.stringify(sourceFileObjects, null, 2))

  // cp files to new dir
  const copiedFileObjects = await Promise.all(
    sourceFileObjects.map(async sourceFile => {
      const {
        course_id: courseId,
        id: examId,
        mime_type: mimeType
      } = sourceFile

      const newFilename = generateFilename(courseId, examId, mimeType)
      const newFilePath = path.join(ARCHIVE_FILE_DIR, newFilename)

      await copyFileAsync(sourceFile.file_path, newFilePath)

      return {
        ...sourceFile,
        // store file_path relative to ARCHIVE_FILE_DIR
        file_path: newFilename
      }
    })
  )

  console.log('movedFileObjects', copiedFileObjects)
  await knex.batchInsert('exams', copiedFileObjects, 30)
}

const main = async () => {
  if (process.argv.length !== 3) {
    printHelp()
    process.exit(1)
  }

  const [_, __, sourceDirectory] = process.argv

  if (!fs.existsSync(sourceDirectory)) {
    console.error(`Files directory does not exist: '${sourceDirectory}'`)
    process.exit(1)
  }

  const sourceDirStats = fs.statSync(sourceDirectory)
  if (!sourceDirStats.isDirectory()) {
    console.error(`Files directory was not a directory according to stat.`)
    console.error('If this is wrong, patch this script.')
    console.error(`Files directory: '${sourceDirectory}'`)
    process.exit(1)
  }

  await start(sourceDirectory)
}

main()
