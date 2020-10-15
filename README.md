# exam-archive-new

Actually new exam archive

## Deployment

### Infra

1. ```cd tf```
2. ```AWS_PROFILE=default TF_VAR_aws_profile=default terraform plan```
   - Note: if you've created another `aws` cli profile (e.g. have separate profile for personal and for tkoaly), change `default` to that profile's name
3. ```AWS_PROFILE=default TF_VAR_aws_profile=default terraform apply```

### CI to production
To deploy a new release to production, author a new Github Release. Use semver. Make sure the version string is prefixed with `v`, e.g. `v1.2.30` instead of `1.2.30`. The deployment script does a string replace for this so update that if you want to release non-v-prefixed versions.

## Development

1. Install docker, docker-compose, node
2. Install the Prettier extension for your editor
3. Download the [tarpisto data dump](https://github.com/TKOaly/tarpisto-dev-dump), extract it to some directory
4. Install deps
   - `npm i`
5. Start the database
   - `docker-compose up -d db`
6. Set up .env, probably just rename .env-sample to .env
7. Run db migrations: `npm run db:migrate-dev`
8. Seed your database with the _tarpisto data dump_:
   - This will copy all exam documents from the data dump into the directory specified by `.env`'s ARCHIVE_FILE_DIR environment variable. By default this is the `files/` directory.
   - Make sure the path to the root is the directory whose immediate subdirectories are the course directories, and not some "tarpisto-dev-dump/tarpisto-files"
   - Run: `npm run seed-from-files-dev <path-to-tarpisto-dev-dump-root>`
   - Note: This script can be run even if the database is already initialized. It does not reset the database.
9. `npm run start-dev`
10. ready

## License

MIT
