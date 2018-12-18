# exam-archive-prototype

UI prototype for the new exam archive of TKO-äly ry.

> ![](https://i.imgur.com/1SUPXNu.png)

## Running with Docker

### With the latest build on DockerHub

1. Install [Docker](https://www.docker.com/get-started)
2. Run `docker run -it -p 1234:5000 cxcorp/exam-archive-prototype`

### Locally

1. Install [Docker](https://www.docker.com/get-started)
2. Build the image with `docker build -t exam-archive-prototype .` (notice the `.`)
3. Start a container with the image: `docker run -it -p 1234:5000 exam-archive-prototype`
    - Add `-d` if you want to run it detached in the background
    - You can replace the port `1234` with whichever port you want - this is the
      port you connect to the server through.

## "Production"

If you really want to, you can run the server in production mode by running
`yarn run serve`. This produces a production build of the frontend and serves
it on port 5000 with [`serve`](https://www.npmjs.com/package/serve).

## Development

#### Steps

1. Clone this repo
2. `yarn`
3. `yarn start`

* install the EditorConfig editor extension
    - the `.editorconfig` file should tell your editor to use the correct
      line endings and tab widths
* install the Prettier editor extension
* `npm install --global eslint` and install an eslint extension for your editor

## License

MIT license, see LICENSE
