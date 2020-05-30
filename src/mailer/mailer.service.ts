import { Injectable, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { JSDOM } from 'jsdom';

import { Mailable, MailOptions } from './interface/mailer.interface';
import { ViewService } from '../view/view.service';

@Injectable()
export class MailerService implements OnModuleInit {

    transport: Transporter;

    constructor(
        private configService: ConfigService,
        private viewService: ViewService
    ) {}

    onModuleInit() {
        this.transport = createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            auth: {
                user: this.configService.get<string>('SMTP_USERNAME'),
                pass: this.configService.get<string>('SMTP_PASSWORD')
            },
            requireTLS: true
        });
    }

    createMailable(data): Mailable {

        return {
            from: this.configService.get<string>('SMTP_USERNAME'),
            to: data.to,
            subject: data.subject,
            html: this.createView(data.viewName, data.input)
        }
    }

    private createView(viewName: string, inputData) {

        const dom = new JSDOM(this.viewService.get(viewName));

        Object.entries(inputData).forEach(([key, value]: [string, string]) => {
            dom.window.document.querySelector(`#${key}`).innerHTML = value;
        });

        return dom.serialize();
    }

    async send(data: MailOptions) {
        const mail: Mailable = this.createMailable(data);
        const mailResponse = await this.transport.sendMail(mail);
        return mailResponse;
    }
}
