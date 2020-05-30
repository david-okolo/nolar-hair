import { MailDriver } from "../interface/mailer.interface";
import { Inject, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export class SMTPDriver extends MailDriver {
    
    constructor(@Inject(forwardRef(() => ConfigService)) private configService: ConfigService)
    {
        super();
    }

    getOptions(): object {
        return {
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            auth: {
                user: this.configService.get<string>('SMTP_USERNAME'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
            requireTLS: this.configService.get<boolean>('SMTP_TLS')
        }
    }
}