import { RequestHandler } from 'express'
import {
  UserRole,
  UserMembership,
  UserServiceUser
} from './service/tkoUserService'

export type AccessRight = 'access' | 'upload' | 'remove'

export const requireRights = (
  ...requiredRights: AccessRight[]
): RequestHandler => (req, res, next) => {
  const auth = (req as any).auth as AuthData

  if (!requiredRights.every(right => auth.rights[right])) {
    // TODO: 400 page
    return res.status(401).send('not authorized')
  }

  next()
}

export const isActiveMember = ({ membership }: UserServiceUser) =>
  membership === UserMembership.Jasen ||
  membership === UserMembership.Kannatusjasen ||
  membership === UserMembership.Kunniajasen ||
  membership === UserMembership.Ulkojasen

export const roleRights: {
  [role in UserRole]: { [right in AccessRight]?: boolean }
} = {
  [UserRole.Kayttaja]: { access: true, upload: true, remove: false },
  [UserRole.Tenttiarkistovirkailija]: {
    access: true,
    upload: true,
    remove: true
  },
  [UserRole.Jasenvirkailija]: { access: true, upload: true, remove: false },
  [UserRole.Virkailija]: { access: true, upload: true, remove: false },
  [UserRole.Yllapitaja]: { access: true, upload: true, remove: true }
}

export interface AuthData {
  user: UserServiceUser
  rights: { [right in AccessRight]?: true }
}
