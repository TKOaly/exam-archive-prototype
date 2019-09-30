// @ts-check
/// <reference lib="es2017" />
require('dotenv').config()

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

const DIR_NAME_EXCLUSIONS = new Set(['.git'])

/**
 * @param {string} dirPath
 * @typedef {import("fs").Stats} Stats
 * @typedef {{name: string, path: string, stats: Stats}} DirEntry
 * @returns {Promise<DirEntry[]>}
 */
const readDir = async dirPath => {
  const dirContent = await readdirAsync(dirPath)
  const excludedDirs = dirContent.filter(dirName =>
    DIR_NAME_EXCLUSIONS.has(dirName)
  )
  if (excludedDirs.length > 0) {
    console.log(
      `${excludedDirs.length} directories match dir name exclusions, ignoring them:`
    )
    console.log(excludedDirs)
  }

  const dirs = await Promise.all(
    dirContent
      .filter(dirName => !DIR_NAME_EXCLUSIONS.has(dirName))
      .map(async dirName => {
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

const start = async (sourceDirectory, markDirty) => {
  // Deletes ALL existing entries
  //await knex('courses').del()

  console.group('Reading courses...')
  const courses = await readSubdirs(sourceDirectory)
  console.groupEnd()

  console.group(`Inserting ${courses.length} courses to db...`)
  /** @type {{id: number, name: string}[]} */
  const insertedCourses = await knex
    .batchInsert('courses', courses.map(({ name }) => ({ name })))
    .returning(['id', 'name'])
  console.log('Inserted!')
  console.groupEnd()

  markDirty(`Table "courses" has ${insertedCourses.length} new rows`)

  const courseNameToId = insertedCourses.reduce((map, course) => {
    map.set(course.name, course.id)
    return map
  }, new Map())

  console.group('Reading exam documents...')
  const fileObjectLists = await Promise.all(
    courses.map(async ({ path: courseDirPath, name: courseName }) => {
      const files = await readFiles(courseDirPath)

      return files.map(
        ({ name: fileName, path: filePath, stats: fileStats }) => ({
          course_id: courseNameToId.get(courseName),
          file_name: fileName,
          mime_type: getMimeType(fileName) || 'application/octet-stream',
          file_path: filePath,
          upload_date: dateMin(fileStats.ctime, fileStats.mtime)
        })
      )
    })
  )
  console.log('Ready')
  console.groupEnd()
  const sourceFileObjects = flatten(fileObjectLists)

  console.group(`Copying exam files to ARCHIVE_FILE_DIR="${ARCHIVE_FILE_DIR}"`)
  let successfulCopies = 0
  let copiedFileObjects

  try {
    copiedFileObjects = await Promise.all(
      sourceFileObjects.map(async sourceFile => {
        const newFilename = uuid()
        const newFilePath = path.join(ARCHIVE_FILE_DIR, newFilename)

        await copyFileAsync(sourceFile.file_path, newFilePath)
        successfulCopies++

        return {
          ...sourceFile,
          // store file_path relative to ARCHIVE_FILE_DIR
          file_path: newFilename
        }
      })
    )
  } catch (e) {
    console.error('Failed to copy files')
    markDirty(
      `Dir "${ARCHIVE_FILE_DIR}" has ${successfulCopies} new copied files`
    )
    throw e
  }
  markDirty(
    `Dir "${ARCHIVE_FILE_DIR}" has ${successfulCopies} new copied files`
  )
  console.log('Copied!')
  console.groupEnd()

  console.group(`Inserting ${copiedFileObjects.length} documents to database`)
  const insertedExams = await knex
    .batchInsert('exams', copiedFileObjects)
    .returning('id')
  markDirty(`Table "exams" has ${insertedExams.length} new rows`)
  console.log('Inserted!')
  console.groupEnd()

  console.log('Done!')
  process.exit(0)
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

  const dirty = []
  try {
    await start(sourceDirectory, item => dirty.push(item))
  } catch (e) {
    console.groupEnd()
    console.error('ERROR!', e)
    console.error()
    console.error('NOTE: The following things have been left dirty:')
    console.error(dirty.map(str => `  - ${str}`).join('\n'))
  }
}

main()
