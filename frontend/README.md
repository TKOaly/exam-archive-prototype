# tarpisto-jsplz

TKO-äly ry exam archive, modernized.

## Development

#### Steps

1. git clone
2. npm i
3. npm start

* install the EditorConfig editor extension
* install the Prettier editor extension
* `npm install --global eslint` and install an eslint extension

#### Note

.css files are output, edit .scss files

## Roadmap to MVP

MVP defined as: _"can do what the old archive can do"_

### ui

* [x] course listing
* [x] breadcrumbs
  * went with a navigation bar instead
    * holy shit it's responsive and it works **_BEAUTIFULLY_**
* [ ] document listing
  * can refit much of the course listing
* [ ] login screen
* [ ] logout button & current user's name
  * probably in `Header`
* [ ] admin abilities
  * [ ] delete things

### api

* [ ] course listing (directory listing)
* [ ] document listing (file listing)
  * name, last modified, size
* [ ] login
  * should also include data about whether or not the user is allowed to delete/upload
* [ ] course creation
* [ ] document uploads to courses
* [ ] `admins` - document deletion
* [ ] `admins` - course deletion

## License

MIT license, see LICENSE
