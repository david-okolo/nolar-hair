import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { LoggerService } from '../logger/logger.service';
import { CheckBookingDto } from './dto/check-booking.dto';
import { MockLoggerService } from '../../test/mocks/logger/mocklogger.service';
import { MockBookingService } from '../../test/mocks/booking/mockbooking.service';

describe('Booking Controller', () => {
  let controller: BookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: LoggerService,
          useValue: MockLoggerService
        },
        {
          provide: BookingService,
          useClass: MockBookingService
        }
      ]
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a booking (paid)', async () => {
    const body: CreateBookingDto = {
      name: 'test',
      email: 'test@test.com',
      requestedAppointmentTime: 159,
      requestedService: 'Trichiology',
      paidRequest: true
    };

    const createBookingResponse = {
      success: true,
        message: 'Booking Creation Successful',
        data: {
          payment: true,
          paymentLink: 'http://paystack.com/',
          reference: 'refNo',
        },
        errors: []
    }

    expect(await controller.create(body)).toMatchObject(createBookingResponse);
  });

  it('should check the status of a booking (paid successful)', async () => {
    const request: CheckBookingDto = {
      reference: 'refPaid'
    };

    const checkBookingResponse = {
      success: true,
      message: 'Booking Check Successful',
      data: {
        email: 'test@test.com',
        paid: true,
        timeSlot: '11:00 AM',
        date: '2020-05-30',
        service: 'Barbing',
        status: 'confirmed'
      },
      errors: []
    };

    expect(await controller.check(request)).toMatchObject(checkBookingResponse)
  });

  it('should check the status of a booking (free successful)', async () => {
    expect(await controller.check({reference: 'refNo'})).toMatchObject({
      success: true,
      message: 'Booking Check Successful',
      data: {
        email: 'test@test.com',
        paid: false,
        timeSlot: '11:00 AM',
        date: '2020-05-30',
        service: 'Barbing',
        status: 'pending'
      },
      errors: []
    });
  })

  it('should check the status of a booking (does not exist)', async () => {
    expect(await controller.check({reference: 'refUndefined'})).toMatchObject({
      success: false,
      message: 'Booking Check Failed',
      data: {},
      errors: ['Booking does not exist']
    });
  })
});
