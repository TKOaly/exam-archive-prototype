# exam-archive-new

Actually new exam archive

## Deployment

### Infra

1. ```cd tf```
2. Set correct AWS CLI profile 
   ```
   export AWS_PROFILE=default
   export TF_VAR_aws_profile=default
   ```
   - Note: if you've created another `aws` cli profile (e.g. have separate profile for personal and for tkoaly), change `default` to that profile's name
3. ```terraform plan```
   - Will ask for `var.image_version_tag`, set to the deployment tag (latest version in Github Releases), specify **without** `v`, e.g. `1.2.30`.
     - If tired of doing it again, `export TF_VAR_image_version_tag=1.2.30`
5. ```terraform apply```

### CI to production
To deploy a new release to production, author a new Github Release. Use semver. Make sure the version string is prefixed with `v`, e.g. `v1.2.30` instead of `1.2.30`. The deployment script does a string replace for this, so if you want to release non-v-prefixed versions, update the Github action workflow.

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

## Docker warning
The `.dockerignore` is configured to work as a whitelist so if you add new files or folders which you want to include in the Docker image, update [`.dockerignore`](https://github.com/TKOaly/exam-archive-new/blob/master/.dockerignore).

## License

MIT
