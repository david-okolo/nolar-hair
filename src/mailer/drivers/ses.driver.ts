import { MailDriver } from "../interface/mailer.interface";
import AWS, { SES } from "aws-sdk";
import { Inject, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export class SESDriver extends MailDriver {
    aws: SES;
    constructor(@Inject(forwardRef(() => ConfigService)) private configService: ConfigService) {
        super();
        AWS.config.update({
            secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            region: this.configService.get<string>('AWS_REGION')
        })
        this.aws = new AWS.SES();
    }

    getOptions(): object {
        return {
            SES: this.aws
        }
    }
}