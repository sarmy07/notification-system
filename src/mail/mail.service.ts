import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Notification System" <${this.configService.get('MAIL_FROM')}>`,
        // the "from" name appears in the inbox as "Notification System"
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      throw error;
    }
  }

  // builds a clean HTML email template
  buildEmailTemplate(title: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
            .header { background: #4F46E5; padding: 24px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 22px; }
            .body { padding: 32px; color: #333; }
            .body p { font-size: 16px; line-height: 1.6; }
            .footer { background: #f4f4f4; padding: 16px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>${title}</h1></div>
            <div class="body"><p>${message}</p></div>
            <div class="footer">
              You received this because you have notifications enabled.
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
