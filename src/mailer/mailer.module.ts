import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigModule } from '@nestjs/config';
import { ViewModule } from '../view/view.module';

@Module({
  imports: [ConfigModule, ViewModule],
  providers: [MailerService],
  exports: [MailerService]
})
export class MailerModule {}
