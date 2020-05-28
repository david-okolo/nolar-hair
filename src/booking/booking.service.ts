import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { PaymentService } from '../payment/payment.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
        private logger: LoggerService,
        private paymentService: PaymentService,
        private configService: ConfigService
    ) {}

    
    async createBooking(data: CreateBookingDto) {
        const result = {
            created: false,
            paymentInitialized: false,
            paymentUrl: null,
            reference: null
        }

        const booking = await this.bookingRepository.save({
            name: data.name,
            email: data.email,
            appointmentTime: data.requestedAppointmentTime,
            service: data.requestedService
        }).catch(e => {
            this.logger.error(e.message, e.stack)
        });

        if(booking && data.paid)
        {
            result.created = true;
            result.paymentInitialized = true;

            const payment = await this.paymentService.initializePayment({
                email: data.email,
                amount: this.configService.get<number>('BOOKING_PRICE'),
                reference: booking.reference
            }).catch(e => {
                result.paymentInitialized = false;
                this.logger.error(e.message, e.stack);
            })

            result.paymentUrl = payment ? payment.url : null;
            result.reference = payment ? payment.reference : null;
        }

        return result;
    }
}
