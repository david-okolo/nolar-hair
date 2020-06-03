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
import { ICheckBookingResult, BookingStatus } from './interface/booking.interface';
import { WORK_DAY_START_NORMAL, WORK_DAY_END_NORMAL, TIME_SLOT_INTERVAL, WORK_DAY_START_SUNDAY, WORK_DAY_END_SUNDAY } from '../lib/utils/time';

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
            paymentRequested: data.paidRequest,
            paymentInitialized: false,
            paymentUrl: null,
            reference: null,
            errors: []
        }

        const validity = await this.timeSlotsAreValid([data.requestedAppointmentTime], data.requestedService).catch(e => {
            throw e;
        });

        let booking;

        if (validity.status) {
            booking = await this.bookingRepository.save({
                name: data.name,
                email: data.email,
                requestedAppointmentTime: data.requestedAppointmentTime,
                service: data.requestedService,
                paidRequest: data.paidRequest
            }).catch(e => {
                result.errors.push('Error saving booking to database');
                this.logger.error(`Booking creation for 'email: ${data.email}' error - ${e.message}`, e.stack)
            });
        } else {
            result.errors.push('Time slot has been taken');
            return result;
        }

        if(booking && data.paidRequest)
        {
            result.created = true;
            result.paymentInitialized = true;

            const start = process.hrtime();
            const payment = await this.paymentService.initializePayment({
                email: data.email,
                amount: this.configService.get<number>('BOOKING_PRICE_IN_KOBO'),
                booking: booking
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

    async checkBooking(reference: string): Promise<ICheckBookingResult >{

        const result: ICheckBookingResult = {
            email: '',
            paidRequest: false,
            paymentStatus: false,
            timeSlot: '',
            service: '',
            status: BookingStatus.failed,
            errors: []
        }

        // check database for booking by reference
        const booking = await this.bookingRepository.findOne(
            {
                reference: reference
            },
            { 
                relations: ['payment']
            }
        ).catch(e => {
            this.logger.error(e.message, e.stack)
        });

        if(!booking) {
            result.errors.push('Booking does not exist')
            return result;
        }

        // if entity has a paid value of true, check the payment table for the status of the transaction
        let date = new Date(Number(booking.requestedAppointmentTime));
        result.status = BookingStatus.pending;

        if(booking.approvedAppointmentTime) { // if the approved appointment time is set then the booking request has been approved by owner
            date = new Date(Number(booking.approvedAppointmentTime));
            result.status = BookingStatus.success
        }

        result.email = booking.email;
        result.timeSlot = date.toString();
        result.service = booking.service;

        if(booking.paidRequest) {
            result.paidRequest = true;

            if(!booking.payment.verified || !booking.payment.success) {
                // if the transaction has not been verified or status is false, make a call to paystack to check
                const paymentVerified = await this.paymentService.verifyPayment(booking.reference).catch(e => {
                    throw e;
                })

                if(paymentVerified) {
                    result.paymentStatus = true;
                }
            } else {
                result.paymentStatus = true;
            }
        }

        return result;
    }

    async timeSlotsAreValid(timestamps: number[], serviceName: string) {
        // no paid or approved booking for the same service must have been made in that timeslot
        const result = await this.bookingRepository.find({ 
            where: timestamps.map(timestamp => {
                return {
                    requestedAppointmentTime: timestamp,
                    service: serviceName
                };
            }),
            relations: [ 'payment' ]
        }).catch(e => {
            throw e;
        });

        return {
            status: result.length === 0,
            data: new Set(result.map(booking => {
                if(booking.payment && (booking.payment.success && booking.payment.verified)) {
                    return Number(booking.approvedAppointmentTime ? booking.approvedAppointmentTime : booking.requestedAppointmentTime);
                }

                return 0;
            }))
        }
    }

    /**
     * Returns time slots for a given period
     * @param { number } period - number of days
     */
    async getTimeSlotsByService(period: number, serviceName: string): Promise<object> {
        // build object with keys as day timestamp (convert to date) and value as an array of tomestamps for start of slots
        const result = {};

        const today = new Date();

        for(let i = 0; i < period; i++) {

            const timeSlots: number[] = [];

            const dayOfTheMonth = today.getUTCDate();
            today.setUTCDate(dayOfTheMonth + (i === 0 ? 0 : 1));

            today.setUTCHours(0, 0, 0, 0);
            const todayTimestamp: number = today.getTime();

            if(today.getDay() > 0) { // 6 is the day code for sunday

                for(let j = WORK_DAY_START_NORMAL; j < WORK_DAY_END_NORMAL; j = j + TIME_SLOT_INTERVAL) {
                    today.setUTCHours(j, 0, 0, 0);
                    if(today.getTime() > Date.now()) {
                        timeSlots.push(today.getTime());
                    }
                }
            } else {
                for(let j = WORK_DAY_START_SUNDAY; j < WORK_DAY_END_SUNDAY; j = j + TIME_SLOT_INTERVAL) {
                    today.setUTCHours(j, 0, 0, 0);
                    if(today.getTime() > Date.now()) {
                        timeSlots.push(today.getTime());
                    }
                }
            }

            if(timeSlots.length > 0) {
                const validity = await this.timeSlotsAreValid(timeSlots, serviceName).catch(e => {
                    throw e;
                });
    
                if(validity.status) {
                    result[todayTimestamp] = timeSlots;
                } else {
                    result[todayTimestamp] = timeSlots.filter(timeSlot => {
                        return !validity.data.has(timeSlot);
                    })
                }
            }
        }
        return result;
    }
}
