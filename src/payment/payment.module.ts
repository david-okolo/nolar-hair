import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentDriver } from './interface/payment-driver.interface';
import { PaystackDriver } from './drivers/paystackDriver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { LoggerModule } from '../logger/logger.module';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Payment]), LoggerModule, HttpModule],
  exports: [PaymentService],
  providers: [
    PaymentService,
    {
      provide: PaymentDriver,
      useClass: PaystackDriver
    }
  ],
  controllers: [PaymentController]
})
export class PaymentModule {}
