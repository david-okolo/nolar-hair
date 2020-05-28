import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { LoggerModule } from '../logger/logger.module';
import { PaymentModule } from '../payment/payment.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule, TypeOrmModule.forFeature([Booking]), LoggerModule, PaymentModule],
  controllers: [BookingController],
  providers: [BookingService]
})
export class BookingModule {}
