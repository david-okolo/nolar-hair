import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigModule } from '@nestjs/config';
import { ViewModule } from '../view/view.module';
import { MailDriver } from './interface/mailer.interface';
import { SESDriver } from './drivers/ses.driver';

@Module({
  imports: [ConfigModule, ViewModule],
  providers: [
    MailerService,
    {
      provide: MailDriver,
      useClass: SESDriver
    }
  ],
  exports: [MailerService]
})
export class MailerModule {}
