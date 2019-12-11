const withSass = require('@zeit/next-sass')
const withCss = require('@zeit/next-css')
const withImages = require('next-images')
const withTM = require('next-transpile-modules')

module.exports = withImages(
  withCss(
    withSass(
      withTM({
        transpileModules: ['react-date-picker']
      })
    )
  )
)
