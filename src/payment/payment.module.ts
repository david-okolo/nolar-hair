import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentDriver } from './interface/payment-driver.interface';
import { PaystackDriver } from './drivers/paystackDriver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Payment]), LoggerModule],
  exports: [PaymentService],
  providers: [
    PaymentService,
    {
      provide: PaymentDriver,
      useClass: PaystackDriver
    }
  ]
})
export class PaymentModule {}
