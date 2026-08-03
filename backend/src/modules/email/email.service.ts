import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfig } from 'src/config/configuration';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(private readonly config: AppConfig) {
    if (this.config.email.user && this.config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: this.config.email.host,
        port: this.config.email.port,
        secure: this.config.email.port === 465,
        auth: { user: this.config.email.user, pass: this.config.email.pass },
      });
    } else {
      this.logger.warn('SMTP not configured — emails will not be sent');
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.config.nodeEnv === 'development' ? 'http://localhost:3000' : 'https://admin.innsync.app'}/authentication/reset-password?token=${token}`;

    if (!this.transporter) {
      this.logger.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.email.from,
        to: email,
        subject: 'Reset your InnSync password',
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, ignore this email.</p>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${email}`, err);
      throw err;
    }
  }
}
