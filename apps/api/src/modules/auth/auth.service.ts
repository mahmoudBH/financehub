// ============================================
// Auth Service - Authentication Business Logic
// ============================================
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../audit/audit.service';
import {
  SignupDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponseDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private auditService: AuditService,
  ) {}

  // ─── SIGNUP ─────────────────────────────────
  async signup(dto: SignupDto, ip?: string, userAgent?: string): Promise<AuthResponseDto> {
    // Check existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Generate account number
    const accountNumber = this.generateAccountNumber();
    const iban = this.generateIBAN();

    // Create user with default account in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          status: 'ACTIVE', // For simulator, skip email verification
          emailVerified: true,
        },
      });

      // Create default checking account with initial balance
      await tx.account.create({
        data: {
          accountNumber,
          name: 'Main Checking Account',
          type: 'CHECKING',
          status: 'ACTIVE',
          currency: 'EUR',
          balance: 10000.00, // Simulator: start with demo balance
          availableBalance: 10000.00,
          userId: newUser.id,
          isDefault: true,
          iban,
          bic: 'FNHBFRPP',
        },
      });

      // Create email verification token (simulated)
      const verificationToken = nanoid(32);
      await tx.emailVerificationToken.create({
        data: {
          tokenHash: await bcrypt.hash(verificationToken, 10),
          userId: newUser.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });

      return newUser;
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, ip, userAgent);

    // Audit log
    await this.auditService.log({
      action: 'SIGNUP',
      userId: user.id,
      description: `New user registered: ${user.email}`,
      ipAddress: ip,
      userAgent,
    });

    // Create welcome notification
    await this.prisma.notification.create({
      data: {
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Welcome to FinanceHub! 🎉',
        message: `Hello ${user.firstName}, your account has been created successfully. Start by exploring your dashboard.`,
        userId: user.id,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // ─── LOGIN ──────────────────────────────────
  async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, ip, userAgent);

    // Audit log
    await this.auditService.log({
      action: 'LOGIN',
      userId: user.id,
      description: `User logged in: ${user.email}`,
      ipAddress: ip,
      userAgent,
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // ─── LOGOUT ─────────────────────────────────
  async logout(userId: string, refreshToken: string, ip?: string, userAgent?: string): Promise<void> {
    // Hash the token to find it
    const tokenRecords = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    // Revoke matching token
    for (const record of tokenRecords) {
      const isMatch = await bcrypt.compare(refreshToken, record.tokenHash);
      if (isMatch) {
        await this.prisma.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }

    // Blacklist access token in Redis
    await this.redisService.set(`blacklist:${userId}`, 'true', 900); // 15 min

    await this.auditService.log({
      action: 'LOGOUT',
      userId,
      description: 'User logged out',
      ipAddress: ip,
      userAgent,
    });
  }

  // ─── REFRESH TOKEN ──────────────────────────
  async refreshTokens(refreshToken: string, ip?: string, userAgent?: string): Promise<AuthResponseDto> {
    // Find valid token
    const tokenRecords = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    let matchedRecord: any = null;
    for (const record of tokenRecords) {
      const isMatch = await bcrypt.compare(refreshToken, record.tokenHash);
      if (isMatch) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: matchedRecord.id },
      data: { revokedAt: new Date() },
    });

    const user = matchedRecord.user;

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, ip, userAgent);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // ─── FORGOT PASSWORD ───────────────────────
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const resetToken = nanoid(32);
    const tokenHash = await bcrypt.hash(resetToken, 10);

    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
      },
    });

    // In a real app, send email here. For simulator, log the token.
    this.logger.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  // ─── RESET PASSWORD ────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenRecords = await this.prisma.passwordResetToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let matchedToken: any = null;
    for (const record of tokenRecords) {
      const isMatch = await bcrypt.compare(dto.token, record.tokenHash);
      if (isMatch) {
        matchedToken = record;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matchedToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens for security
      this.prisma.refreshToken.updateMany({
        where: { userId: matchedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.auditService.log({
      action: 'PASSWORD_RESET',
      userId: matchedToken.userId,
      description: 'Password reset via email token',
    });

    return { message: 'Password has been reset successfully' };
  }

  // ─── VERIFY EMAIL ──────────────────────────
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const tokenRecords = await this.prisma.emailVerificationToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let matchedToken: any = null;
    for (const record of tokenRecords) {
      const isMatch = await bcrypt.compare(dto.token, record.tokenHash);
      if (isMatch) {
        matchedToken = record;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matchedToken.userId },
        data: { emailVerified: true, status: 'ACTIVE' },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: matchedToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  // ─── HELPERS ────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    ip?: string,
    userAgent?: string,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = nanoid(64);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Store hashed refresh token
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId,
        userAgent,
        ipAddress: ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }

  private generateAccountNumber(): string {
    const prefix = 'FH';
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    return `${prefix}${random}`;
  }

  private generateIBAN(): string {
    const countryCode = 'FR';
    const checkDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const bban = Array.from({ length: 23 }, () => Math.floor(Math.random() * 10)).join('');
    return `${countryCode}${checkDigits}${bban}`;
  }
}
