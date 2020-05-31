import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { PaymentService } from '../payment/payment.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';
import { Payment } from '../entities/payment.entity';
import { MockLoggerService } from '../../test/mocks/logger/mocklogger.service';
import { MockPaymentService } from '../../test/mocks/payment/mockpayment.service';
import { MockBookingRepository } from '../../test/mocks/booking/booking.repository'
import { MockPaymentRepository } from '../../test/mocks/payment/payment.repository';
import { MockMailerService } from '../../test/mocks/mailer/mockmailer.service';
import { BookingStatus } from './interface/booking.interface';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PaymentService,
          useValue: MockPaymentService
        },
        {
          provide: LoggerService,
          useValue: MockLoggerService
        },
        ConfigService,
        {
          provide: getRepositoryToken(Booking),
          useValue: MockBookingRepository
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: MockPaymentRepository
        },
        {
          provide: MailerService,
          useValue: MockMailerService
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
      paidRequest: true
    })).toMatchObject({
      created: true,
      paymentRequested: true,
      paymentInitialized: true,
      paymentUrl: 'http://paystack.com',
      reference: 'refNo',
      errors: []
    });
  });

  it('should return details on booking', async () => {
    expect(await service.checkBooking('refPaidVerified')).toMatchObject({
        email: 'test@test.com',
        paidRequest: true,
        paymentStatus: true,
        timeSlot: '11:00:00 AM',
        date: 'Mon Jun 01 2020',
        service: 'Barbing',
        status: BookingStatus.success,
        errors: []
    });
  })

  it('should return details on booking', async () => {
    expect(await service.checkBooking('refPaidUnverified')).toMatchObject({
        email: 'test@test.com',
        paidRequest: true,
        paymentStatus: true,
        timeSlot: '12:00:00 PM',
        date: 'Mon Jun 01 2020',
        service: 'Barbing',
        status: BookingStatus.pending,
        errors: []
    });
  })

  it('should return details on booking', async () => {
    expect(await service.checkBooking('refFreeApproved')).toMatchObject({
        email: 'test@test.com',
        paidRequest: false,
        paymentStatus: false,
        timeSlot: '11:00:00 AM',
        date: 'Mon Jun 01 2020',
        service: 'Barbing',
        status: BookingStatus.success,
        errors: []
    });
  })

  it('should return details on booking', async () => {
    expect(await service.checkBooking('refFreeUnapproved')).toMatchObject({
        email: 'test@test.com',
        paidRequest: false,
        paymentStatus: false,
        timeSlot: '12:00:00 PM',
        date: 'Mon Jun 01 2020',
        service: 'Barbing',
        status: BookingStatus.pending,
        errors: []
    });
  })

  it('should throw error while returning booking', async () => {
    await expect(service.checkBooking('refError')).rejects.toThrowError(/Payment verification error/);
  });

  it('should not return details on booking', async () => {
    const res = await service.checkBooking('refUndefined');
    expect(res).toHaveProperty('errors');
    expect(res.errors).toContain('Booking does not exist');
  });
});
