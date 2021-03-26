const React = require('react')
const Layout = require('./common/Layout')
const { ControlsBox, Logout } = require('./common/Controls')

const findPrefixes = objects => {
  const map = objects.reduce((map, obj) => {
    const keyParts = obj.file_path.split('/')
    const key = keyParts.length > 1 ? keyParts[0] : '<none>'
    const count = map.get(key) || 0
    map.set(key, count + 1)
    return map
  }, new Map())
  return [...map.entries()].sort((a, b) => a[1] - b[1])
}

const parseObjectKey = filePath => {
  const parts = filePath.split('/')
  return parts.length > 1
    ? {
        prefix: parts[0],
        object: parts[1]
      }
    : {
        prefix: '',
        object: filePath
      }
}
const sortByPrefixThenObjNameAsc = (aObj, bObj) => {
  const a = parseObjectKey(aObj.file_path)
  const b = parseObjectKey(bObj.file_path)
  const byPrefix = a.prefix.localeCompare(b.prefix)
  return byPrefix === 0 ? a.object.localeCompare(b.object) : byPrefix
}

const IndexPage = ({ flash, username, s3Objects, s3DevPrefix }) => {
  const prefixesByCount = findPrefixes(s3Objects)
  const objects = s3Objects.sort(sortByPrefixThenObjNameAsc)
  return (
    <Layout flash={flash}>
      <p>
        <a href="/">{'<- '}Back</a>
      </p>
      <h1>Developer tools</h1>
      <h2>Apply AWS_S3_DEV_PREFIX</h2>

      <p>
        <pre>AWS_S3_DEV_PREFIX={s3DevPrefix}</pre>
      </p>

      <h3>Object prefixes in database</h3>
      <table>
        <thead>
          <tr>
            <th>Prefix</th>
            <th>Objects with prefix</th>
          </tr>
        </thead>

        <tbody>
          {prefixesByCount.map(([prefix, count]) => (
            <tr key={prefix}>
              <td>{prefix}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Apply AWS_S3_DEV_PREFIX to all objects in database</h3>
      <form action="/dev/apply-s3-dev-prefix" method="post">
        <p>
          Specify new prefix to apply to all exam file_paths, or leave empty to
          remove all prefixes.
        </p>
        <label>
          <input type="text" name="devPrefix" value={s3DevPrefix} />
          <input type="submit" value="Apply" />
          <p>
            NOTE: Does not modify objects in S3! Make a copy of the objects
            under <c>template</c> for yourself.
          </p>
        </label>
      </form>

      <h3>Objects in database</h3>
      <div className="developer-s3__table-container">
        <table className="developer-s3__table">
          <thead>
            <tr>
              <th>id</th>
              <th>file_name</th>
              <th>file_path/object key</th>
            </tr>
          </thead>
          <tbody>
            {objects.map(({ id, file_name, file_path }) => (
              <tr key={[id, file_name, file_path].join('-')}>
                <td>{id}</td>
                <td>{file_name}</td>
                <td>{file_path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ControlsBox>
        <Logout username={username} />
      </ControlsBox>
    </Layout>
  )
}

module.exports = IndexPage
