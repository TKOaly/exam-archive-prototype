// @ts-check
/// <reference types="node" />
/// <reference lib="es2017" />

if (process.env.NODE_ENV !== 'development') {
  throw new Error('DANGER: Attempting to run seeds when not in development!')
}
require('dotenv').config()
const path = require('path')
const util = require('util')
const fs = require('fs')
const mime = require('mime')
const flatten = require('lodash/flatten')
const dateMin = require('date-fns/min')

const statAsync = util.promisify(fs.stat)
const readdirAsync = util.promisify(fs.readdir)

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

exports.seed = async knex => {
  // Deletes ALL existing entries
  await knex('courses').del()

  const courses = (await readSubdirs(ARCHIVE_FILE_DIR)).map(addDirId)
  const courseObjects = courses.map(({ id, name }) => ({ id, name }))

  await knex.batchInsert('courses', courseObjects, 30)

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
  const fileObjects = flatten(fileObjectLists)

  await knex.batchInsert('exams', fileObjects, 30)
}
