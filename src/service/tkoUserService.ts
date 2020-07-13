import axios from 'axios'
import querystring from 'querystring'
import config from '../config'

export enum UserRole {
  Kayttaja = 'kayttaja',
  Virkailija = 'virkailija',
  Tenttiarkistovirkailija = 'tenttiarkistovirkailija',
  Jasenvirkailija = 'jasenvirkailija',
  Yllapitaja = 'yllapitaja'
}

export enum UserMembership {
  EiJasen = 'ei-jasen',
  Erotettu = 'erotettu',
  Ulkojasen = 'ulkojasen',
  Jasen = 'jasen',
  Kannatusjasen = 'kannatusjasen',
  Kunniajasen = 'kunniajasen'
}

export const getUserServiceLoginUrl = () => {
  const query = querystring.stringify({
    serviceIdentifier: config.USER_SERVICE_SERVICE_ID
  })
  return `${config.USER_SERVICE_URL}?${query}`
}

export const getUserServiceLogoutUrl = () => {
  const query = querystring.stringify({
    serviceIdentifier: config.USER_SERVICE_SERVICE_ID
  })
  return `${config.USER_SERVICE_URL}/logout?${query}`
}

const client = axios.create({
  baseURL: `${config.USER_SERVICE_URL}/api`
})

interface UserServicePayload<T> {
  ok: boolean
  message: string
  payload: T
}

export interface UserServiceUser {
  username: string
  role: UserRole
  membership: UserMembership
}

const withHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    service: config.USER_SERVICE_SERVICE_ID
  }
})

export const getMe = (
  token: string
): Promise<UserServicePayload<UserServiceUser>> =>
  client
    .get('/users/me', withHeaders(token))
    .then(({ data }: { data: UserServicePayload<UserServiceUser> }) => data)
    .catch(e => e.response)
