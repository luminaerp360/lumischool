import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { User, UserDocument } from "../users/schemas/user.schema";
import {
  LoginDto,
  RegisterSchoolDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "./dto/auth.dto";
import { EmailService } from "./email.service";
import { Role } from "../../common/enums/roles.enum";
import { JwtPayload } from "./strategies/jwt.strategy";
import { ApiResponse } from "../../common/dto/api-response.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /** Login with email + password. Returns access + refresh tokens. */
  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Hash and store refresh token
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.lastLoginAt = new Date();
    await user.save();

    return ApiResponse.success(
      {
        accessToken,
        refreshToken,
        user: this.sanitizeUser(user),
      },
      "Login successful",
    );
  }

  /** Register a new user (typically during school onboarding) */
  async register(dto: RegisterSchoolDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.userModel.findOne({
      tenantId: dto.tenantId || null,
      email,
    });
    if (existing) {
      throw new ConflictException("Email already registered for this school");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const role = dto.role || Role.SCHOOL_ADMIN;

    const user = await this.userModel.create({
      tenantId: dto.tenantId || null,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email,
      passwordHash,
      role,
      isActive: true,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return ApiResponse.success(
      {
        accessToken,
        refreshToken,
        user: this.sanitizeUser(user),
      },
      "Registration successful",
    );
  }

  /** Refresh access token using a valid refresh token */
  async refreshToken(userId: string, rawRefreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const isValid = await bcrypt.compare(
      rawRefreshToken,
      user.refreshTokenHash,
    );
    if (!isValid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Rotate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return ApiResponse.success(
      { accessToken, refreshToken },
      "Token refreshed",
    );
  }

  /** Logout — invalidate refresh token */
  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { refreshTokenHash: null },
    });
    return ApiResponse.success(null, "Logged out successfully");
  }

  /** Initiate password reset — sends email with reset token */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return ApiResponse.success(
        null,
        "If the email exists, a reset link has been sent",
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetUrl,
    );

    return ApiResponse.success(
      null,
      "If the email exists, a reset link has been sent",
    );
  }

  /** Reset password using the token from email */
  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(dto.token)
      .digest("hex");

    const user = await this.userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokenHash = undefined; // Invalidate all sessions
    await user.save();

    return ApiResponse.success(null, "Password reset successfully");
  }

  /** Change password for authenticated user */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.refreshTokenHash = undefined; // Invalidate all sessions
    await user.save();

    return ApiResponse.success(null, "Password changed successfully");
  }

  /** Get current user profile */
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return ApiResponse.success(this.sanitizeUser(user), "Profile retrieved");
  }

  // ── Private helpers ──────────────────────────────────────

  private generateAccessToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      tenantId: user.tenantId?.toString() || null,
      role: user.role,
      email: user.email,
    };

    return this.jwtService.sign(payload as any, {
      secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.configService.get<string>(
        "JWT_ACCESS_EXPIRES_IN",
        "15m",
      ) as any,
    });
  }

  private generateRefreshToken(user: UserDocument): string {
    const payload = { sub: user._id.toString(), type: "refresh" };

    return this.jwtService.sign(payload as any, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>(
        "JWT_REFRESH_EXPIRES_IN",
        "7d",
      ) as any,
    });
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject();
    delete obj.passwordHash;
    delete obj.refreshTokenHash;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpiresAt;
    return obj;
  }
}
