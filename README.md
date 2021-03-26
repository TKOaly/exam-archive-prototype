# exam-archive-new

Actually new exam archive

## Deployment

### Manual infra setup with Terraform

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

### 1. Install tools and deps

- Install Docker and docker-compose
- Install Node.JS (>=v12)
- Install the Prettier formatter extension for your editor
- Run `npm install`
- Set up `user-service` and make sure that there's a service for exam-archive, might need to change the permission bits to `770`.

### 2. Setup environment variables

Copy `.env-sample` to `.env` and fill in the following environment variables. The others should be alright.

| Key | Value | Needed for | Example |
| ------------- |-------------| - | - |
| `USER_SERVICE_ID` | The UUID that you've assigned to this service in `user-service` | Logging in, auth | `11188b9c-9534-4faf-8355-60973b720647` |
| `USER_SERVICE_URL` | The address of the user service | Logging in, auth | `http://localhost:8080` |
| `AWS_ACCESS_KEY_ID` | Your AWS access key's ID. If you've used the `aws` CLI, find it at `~/.aws/credentials`, or create a new key via AWS console -> Click on your username dropdown in navbar -> My security sredentials -> Access keys for CLI, SDK, & API access  | Uploading, renaming files | |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret access key  | Uploading, renaming files | |
| `AWS_CF_KEY_ID` | The CloudFront signed URL signing key's ID. Find it from AWS console -> AWS Systems Manager -> Parameter Store, search for `exam-archive-dev-cf-signing-key-id` | Generating signed URLs to view the exams | |
| `AWS_CF_KEY` | The CloudFront signed URL private signing key. Find it from the same place as above, under `exam-archive-dev-cf-signing-key`. It's multi-line, turn it into a oneliner by escaping the newlines (regex replace in your editor, search for `\n` and replace with `\\n`) and paste it inside quotes.  | Generating signed URLs to view the exams | |
| `AWS_S3_DEV_PREFIX` | A prefix for your development files in the S3 bucket. Just set it to your username or something that isn't already taken. No slashes.  | Separating different devs' files inside the same dev bucket | template |

### 2. Bootstrap development database and S3

```// todo: make a script that does this```

#### Bootstrapping the S3 bucket
1. Sign in to the AWS console and navigate to S3 -> `exam-archive-files-dev`
2. Click on the `template/` directory (directory = prefix since S3 has no real folders)
3. Sort by name
4. Select all objects with the checkbox on the left, Actions -> Copy
5. Set destination to `s3://exam-archive-files-dev/<prefix>/` where `<prefix>` is the value you chose for `AWS_S3_DEV_PREFIX`.
6. Click on Copy
7. Repeat this for all of the pages

#### Bootstrapping the database

1. Download the development database dump (`db.sql`) from [here](https://github.com/TKOaly/exam-archive-dev-db-dump)
2. Start the database and Adminer:
   - ```docker-compose up -d db adminer```
3. Open Adminer (navigate to http://localhost:8082) and log in with the credentials in `docker-compose.yml`, by default they are:
   | Key | Value |
   | ------------- |-------------|
   | System | PostgreSQL |
   | Server | `db` |
   | Username | `tarpisto` |
   | Password | `Su5hgVvoqUCRw5vrWmrW` |
   | Database | `tarpisto` |
4. Click on Import on the left sidebar and upload `db.sql`
5. Run any further possible migrations with `npm run db:migrate-dev`

#### Start it

Run 
```npm run start-dev```

then go to `/dev` (make sure `NODE_ENV=development`) and apply the prefix you chose previously to all exams in the local database.

## Docker warning
The `.dockerignore` is configured to work as a whitelist so if you add new files or folders which you want to include in the Docker image, update [`.dockerignore`](https://github.com/TKOaly/exam-archive-new/blob/master/.dockerignore).

## License

MIT
