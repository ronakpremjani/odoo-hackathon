import nodemailer from 'nodemailer';
import { config } from '../config/env';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize nodemailer transporter if credentials are provided, else fallback to console logging
    if (config.SMTP.USER && config.SMTP.PASS) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP.HOST,
        port: config.SMTP.PORT,
        secure: config.SMTP.PORT === 465,
        auth: {
          user: config.SMTP.USER,
          pass: config.SMTP.PASS,
        },
      });
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: config.SMTP.FROM,
          to,
          subject,
          text,
          html: html || text,
        });
        console.log(`[EmailService] Email sent successfully to: ${to}`);
        return true;
      } else {
        console.log(`========================================`);
        console.log(`  [SIMULATED EMAIL DISPATCH]            `);
        console.log(`  To:      ${to}                         `);
        console.log(`  Subject: ${subject}                    `);
        console.log(`  Body:    ${text}                       `);
        console.log(`========================================`);
        return true;
      }
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${to}:`, error);
      return false;
    }
  }
}
