# exam-archive-new

Actually new exam archive

## Deployment

### Infra

1. ```cd tf```
2. ```AWS_PROFILE=default TF_VAR_aws_profile=default terraform plan```
   - Note: if you've created another `aws` cli profile (e.g. have separate profile for personal and for tkoaly), change `default` to that profile's name
3. ```AWS_PROFILE=default TF_VAR_aws_profile=default terraform apply```

### Code changes

I've been too lazy to set up GH actions so for now you need to docker build & tag & push the new image manually to ECR, then go to the AWS console's **ECS** section and create a new revision of the exam archive task definition, then go to the exam archive service and update it to use the latest revision. This will make AWS spin up a new container with the new image, and after that's up, it'll spin down the old container.

1. `docker build -t tkoaly/exam-archive .`
2. `docker tag tkoaly/exam-archive:latest 123456789.dkr.ecr.eu-west-1.amazonaws.com/tkoaly/exam-archive:latest`
   - `123456789.dkr.ecr.eu-west-1.amazonaws.com` is the ECR address, find this from the AWS console **ECR** section under `tkoaly/exam-archive`
3. `AWS_PROFILE=tekis aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.eu-west-1.amazonaws.com`
   - Replace `AWS_PROFILE=tekis` with your specific `~/.aws/credentials` profile name. If you only have one profile, it's `default` so you can remove `AWS_PROFILE=asdasd` completely
   - `123456789.dkr.ecr.eu-west-1.amazonaws.com` is the ECR address, find this from the AWS console **ECR** section under tkoaly/exam-archive
4. `docker push 123456789.dkr.ecr.eu-west-1.amazonaws.com/tkoaly/exam-archive:latest`
5. AWS console -> ECS -> Task definitions -> Exam archive task -> Create new revision -> skip to review and just do it
   - this will make the task refetch the image I think
6. AWS console -> ECS -> Services -> exam-archive-service -> Update -> change task definition revision to the latest and skip to review and just do it

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
