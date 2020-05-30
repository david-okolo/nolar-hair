import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { LoggerService } from '../logger/logger.service';

describe('Booking Controller', () => {
  let controller: BookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        LoggerService,
        {
          provide: BookingService,
          useValue: {
            createBooking: async () => {
              return {
                created: true,
                paymentRequested: true,
                paymentInitialized: true,
                paymentUrl: 'http://paystack.com/',
                reference: 'refNo',
                errors: []
              }
            }
          }
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
      paid: true
    };

    const result = {
      success: true,
      message: 'Booking Creation Successful',
      data: {
        payment: true,
        paymentLink: 'http://paystack.com/',
        reference: 'refNo',
      },
      errors: []
    }

    expect(await controller.create(body)).toMatchObject(result);
  });
});
