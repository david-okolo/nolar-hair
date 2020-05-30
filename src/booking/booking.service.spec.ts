import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { PaymentService } from '../payment/payment.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PaymentService,
          useValue: {
            initializePayment: async () => {
              return {
                url: 'http://paystack.com',
                accessCode: 'acode',
                reference: 'refNo'
              }
            }
          }
        },
        LoggerService,
        ConfigService,
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            save: async () => {
              return {
                reference: 'refNo'
              }
            }
          }
        },
        {
          provide: MailerService,
          useValue: {
            send: () => {
              return new Promise((resolve, reject) => {
                resolve('Mock mailer');
              })
            }
          }
        }
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should accept and save new booking request', async () => {

    expect(await service.createBooking({
      name: 'test',
      email: 'test@test.com',
      requestedService: 'Barbing',
      requestedAppointmentTime: 1,
      paid: true
    })).toMatchObject({
      created: true,
      paymentRequested: true,
      paymentInitialized: true,
      paymentUrl: 'http://paystack.com',
      reference: 'refNo',
      errors: []
    });
  })
});
