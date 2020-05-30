import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { PaymentService } from '../payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';
import { MailOptions } from '../mailer/interface/mailer.interface';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
        private logger: LoggerService,
        private paymentService: PaymentService,
        private configService: ConfigService,
        private mailerService: MailerService
    ) {
        this.logger.setContext('Booking')
    }

    
    async createBooking(data: CreateBookingDto) {

        this.logger.info(`Booking creation starting...`, JSON.stringify(data));
        const result = {
            created: false,
            paymentRequested: data.paid,
            paymentInitialized: false,
            paymentUrl: null,
            reference: null,
            errors: []
        }

        const booking = await this.bookingRepository.save({
            name: data.name,
            email: data.email,
            appointmentTime: data.requestedAppointmentTime,
            service: data.requestedService
        }).catch(e => {
            result.errors.push('Error saving booking to database');
            this.logger.error(`Booking creation for 'email: ${data.email}' error - ${e.message}`, e.stack)
        });

        if(booking && data.paid)
        {
            result.created = true;
            result.paymentInitialized = true;

            const start = process.hrtime();
            const payment = await this.paymentService.initializePayment({
                email: data.email,
                amount: this.configService.get<number>('BOOKING_PRICE_IN_KOBO'),
                reference: booking.reference
            }).catch(e => {
                result.errors.push(`Error initializing payment using '${this.paymentService.driverName}'`);
                result.paymentInitialized = false;
                this.logger.error(`Booking creation for 'email: ${data.email}' error - ${e.message}`, e.stack);
            })
            const end = process.hrtime(start);

            this.logger.info(`Paystack API took ${((end[0] * 1e9) + end[1])/1e9} seconds to return data`);

            result.paymentUrl = payment ? payment.url : null;
            result.reference = payment ? payment.reference : null;
        }

        if(result.created) {

            const message: MailOptions = {
                to: data.email,
                subject: 'Booking Request',
                viewName: 'bookingRequested',
                input: {
                    recipientName: data.name,
                    serviceRequested: data.requestedService
                }
            };
            
            this.mailerService.send(message).then((response) => {
                this.logger.info(`[Mail] response`, JSON.stringify(response));
            }).catch(e => {
                this.logger.error(`[Mail] sending to ${data.email} failed`, e.stack);
            });
        }

        this.logger.info(`Booking creation for 'email: ${data.email}' ending...`, JSON.stringify(result));

        return result;
    }
}
