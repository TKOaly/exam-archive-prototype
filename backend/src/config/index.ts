const { NODE_ENV } = process.env

if (!NODE_ENV) {
  throw new Error('Required environment variable NODE_ENV is not set!')
}

if (NODE_ENV === 'development') {
  require('dotenv').config()
}

const { ARCHIVE_FILE_DIR, PORT } = process.env

if (!ARCHIVE_FILE_DIR) {
  throw new Error(`Required environment variable ARCHIVE_FILE_DIR is not set!`)
}

const DEFAULT_PORT = '9001'

export default {
  PORT: parseInt(PORT || DEFAULT_PORT, 10),
  ARCHIVE_FILE_DIR,
  NODE_ENV
}
