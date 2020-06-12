import { Controller, Post, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { LoggerService } from '../logger/logger.service';
import { CheckBookingDto } from './dto/check-booking.dto';
import { BookingTimeSlotDto } from './dto/timeslot-booking.dto';
import { DEFAULT_PERIOD } from '../lib/utils/time';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

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
                paymentLink: null,
                reference: null
            },
            errors: []
        }

        const result = await this.bookingService.createBooking(createBookingDto).catch(e => {
            this.logger.error(e.message, e.stack)
        });

        if(result) {

            response.errors = result.errors;

            if((result.created && result.paymentInitialized) || (result.created && !result.paymentRequested)) {
                response.success = true;
                response.message = 'Booking Creation Successful';
            }
            
            if(result.created && result.paymentInitialized) {
                response.data.payment = result.paymentInitialized
                response.data.paymentLink = result.paymentUrl
                response.data.reference = result.reference
            }
        }

        return response;
    }

    @Get('check')
    async check(@Body() checkBookingDto: CheckBookingDto) {
        const response = {
            success: true,
            message: 'Booking Check Successful',
            data: {},
            errors: []
        }
        const result = await this.bookingService.checkBooking(checkBookingDto.reference).catch((e: Error) => {
            this.logger.error(e.message, e.stack);
            response.errors.push(e.message);
        });

        if(!result || result.errors.length > 0)
        {
            response.success = false;
            response.message = 'Booking Check Failed';
            result ? response.errors.push(... result.errors) : response.errors;
            return response;
        }

        response.data = Object.entries(result).reduce((acc, [key, val]) => {
            if(key  !== 'errors')
            {
                acc[key] = val;
            }

            return acc;
        }, {});

        return response;
    }

    @Get('getTimeSlots')
    async getTimeSlots(@Body() bookingTimeSlotDto: BookingTimeSlotDto) {
        const response = {
            success: false,
            message: 'Failed to fetch time slots',
            data: {},
            errors: []
        }

        const result = await this.bookingService.getTimeSlotsByService(DEFAULT_PERIOD, bookingTimeSlotDto.serviceName).catch(e => {
            this.logger.error(e.message, e.stack);
        });

        if(result) {
            response.success = true;
            response.message = 'Time slots fetched successfully'
            response.data = result;
        }

        return response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('edit')
    async editBooking(@Body() booking: any) {
        await this.bookingService.update(booking).catch(e => {
            throw new BadRequestException(e.message);
        });

        return {
            success: true,
            message: 'Booking Updated'
        }
    }

}
