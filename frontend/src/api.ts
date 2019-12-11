const baseUrl = typeof window === 'undefined' ? 'http://localhost:9001' : ''

export const makeUrl = (path: string) => {
  return `${baseUrl}${path}`
}
