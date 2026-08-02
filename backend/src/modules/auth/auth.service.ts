import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import * as bcrypt from 'bcrypt'

const ADMIN_EMAILS = [
  'chrstphrnch@gmail.com',
  'christophertersee21@gmail.com',
  'christopherenoch767@gmail.com',
]
const REFERRER_BONUS_COINS = BigInt(500)
const NEW_USER_BONUS_COINS = BigInt(150)

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private getRoleForEmail(email: string) {
    return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'ADMIN' : 'USER'
  }

  async register(email: string, username: string, password: string, referralCode?: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedReferralCode = referralCode?.trim().toUpperCase()
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { username }] },
    })
    if (existing) {
      throw new BadRequestException('Email or username already exists')
    }

    const referrer = normalizedReferralCode
      ? await this.prisma.user.findUnique({ where: { referralCode: normalizedReferralCode } })
      : null

    if (normalizedReferralCode && !referrer) {
      throw new BadRequestException('Referral code is invalid')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const generatedReferralCode = `EA${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const role = this.getRoleForEmail(normalizedEmail)

    const createdUser = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        username,
        password: hashedPassword,
        referralCode: generatedReferralCode,
        role,
        referredBy: referrer?.id ?? null,
        coins: NEW_USER_BONUS_COINS,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        referralCode: true,
        referredBy: true,
        coins: true,
      },
    })

    if (referrer) {
      await this.prisma.$transaction([
        this.prisma.referral.create({
          data: {
            userId: referrer.id,
            referredId: createdUser.id,
          },
        }),
        this.prisma.user.update({
          where: { id: referrer.id },
          data: {
            coins: {
              increment: REFERRER_BONUS_COINS,
            },
          },
        }),
      ])
    }

    return createdUser
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
