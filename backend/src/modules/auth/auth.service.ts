import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import * as bcrypt from 'bcrypt'

const ADMIN_EMAILS = [
  'chrstphrnch@gmail.com',
  'christophertersee21@gmail.com',
  'christopherenoch767@gmail.com',
]

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private getRoleForEmail(email: string) {
    return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'ADMIN' : 'USER'
  }

  async register(email: string, username: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { username }] },
    })
    if (existing) {
      throw new BadRequestException('Email or username already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const referralCode = `EA${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const role = this.getRoleForEmail(normalizedEmail)

    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        username,
        password: hashedPassword,
        referralCode,
        role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        referralCode: true,
      },
    })
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.role !== 'ADMIN' && this.getRoleForEmail(normalizedEmail) === 'ADMIN') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      })
      user.role = 'ADMIN'
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      referralCode: user.referralCode,
    }
  }
}
