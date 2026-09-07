import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST", "smtp.gmail.com"),
      port: parseInt(this.configService.get<string>("SMTP_PORT", "587"), 10),
      secure: this.configService.get<string>("SMTP_SECURE") === "true",
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    const appName = this.configService.get<string>("APP_NAME", "LumiSchool");

    try {
      await this.transporter.sendMail({
        from: `"${appName}" <${this.configService.get<string>("SMTP_USER", "noreply@lumischool.co.ke")}>`,
        to,
        subject: `${appName} - Password Reset`,
        html: `
          <h2>Password Reset</h2>
          <p>Hello ${name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>- ${appName} Team</p>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}`,
        error.stack,
      );
    }
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
    loginUrl: string,
  ): Promise<void> {
    const appName = this.configService.get<string>("APP_NAME", "LumiSchool");

    try {
      await this.transporter.sendMail({
        from: `"${appName}" <${this.configService.get<string>("SMTP_USER", "noreply@lumischool.co.ke")}>`,
        to,
        subject: `Welcome to ${appName}`,
        html: `
          <h2>Welcome to ${appName}!</h2>
          <p>Hello ${name},</p>
          <p>Your account has been created. Login here:</p>
          <p><a href="${loginUrl}">${loginUrl}</a></p>
          <p>- ${appName} Team</p>
        `,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error.stack);
    }
  }
}
