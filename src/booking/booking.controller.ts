import { Controller, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { LoggerService } from '../logger/logger.service';

@Controller('booking')
export class BookingController {
    constructor(
        private bookingService: BookingService,
        private logger: LoggerService
        ) {}
    @Post()
    async create(@Body() createBookingDto: CreateBookingDto) {

        const response = {
            success: false,
            message: 'Booking Creation Failed',
            data: {
                payment: false,
                paymentLink: '',
                reference: ''
            }
        }

        const result = await this.bookingService.createBooking(createBookingDto).catch(e => {
            this.logger.error(e.message, e.stack)
        });

        if(result && result.created) {
            response.success = true;
            response.message = 'Booking Creation Successful';
            response.data.payment = result.paymentInitialized
            response.data.paymentLink = result.paymentUrl
            response.data.reference = result.reference
        }

        return response;
    }
}
