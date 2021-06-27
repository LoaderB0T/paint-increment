import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigService } from './config.service';

@Injectable()
export class MailService {
  private readonly _configService: ConfigService;

  private readonly _mailTransporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(configService: ConfigService) {
    this._configService = configService;

    this._mailTransporter = createTransport({
      service: this._configService.config.mail.service,
      auth: {
        user: this._configService.config.mail.account,
        pass: this._configService.config.mail.password
      }
    });
  }

  public sendMail(to: string, subject: string, body: string) {
    const mailOptions = {
      from: this._configService.config.mail.account,
      to,
      subject,
      text: body
    };

    this._mailTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent', info);
      }
    });
  }
}
