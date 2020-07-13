declare namespace Express {
  export interface Request {
    flash(msg: string, type: 'error' | 'info'): void
    flash(): { msg: string; type: 'error' | 'info' } | undefined
  }
}
