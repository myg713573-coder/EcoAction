import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

const ADMIN_EMAILS = [
  'chrstphrnch@gmail.com',
  'christophertersee21@gmail.com',
  'christopherenoch767@gmail.com',
]

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const email = ((req.headers['x-user-email'] as string) || '').toLowerCase()
    if (!ADMIN_EMAILS.includes(email)) {
      throw new UnauthorizedException('Admin access required')
    }
    next()
  }
}
