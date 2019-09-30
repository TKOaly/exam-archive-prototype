# exam-archive-new

Actually new exam archive

## Development

1. Install docker, docker-compose, node
2. Install the Prettier extension for your editor
3. Download the [tarpisto data dump](https://github.com/TKOaly/tarpisto-dev-dump), extract it to some directory
4. Install deps
   - `cd frontend && yarn && cd ../backend && yarn`
5. Start the database
   - `./dfco up -d db`
   - note: dfco is just a shell script that takes both docker-compose.*.yml files as input to docker-compose
6. Set up backend .env, probably just rename .env-sample to .env
7. Run db migrations: `backend/$ yarn db:migrate-dev`
8. Seed your database with the _tarpisto data dump_:
   - This will copy all exam documents from the data dump into the directory specified by `backend/.env`'s ARCHIVE_FILE_DIR environment variable. By default this is the `files/` directory.
   - Make sure the path to the root is the directory whose immediate subdirectories are the course directories, and not some "tarpisto-dev-dump/tarpisto-files"
   - Run: `backend/$ yarn seed-from-files-dev <path-to-tarpisto-dev-dump-root>`
   - Note: This script can be run even if the database is already initialized. It does not reset the database.
9. `yarn start-dev` the backend and `yarn start` the frontend
10. ready

## License

MIT
