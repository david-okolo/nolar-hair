import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { MockPayDriver } from '../../test/mocks/payment/mockpayDriver';
import { PaymentDriver } from './interface/payment-driver.interface';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { LoggerService } from '../logger/logger.service';
import { MockLoggerService } from '../../test/mocks/logger/mocklogger.service';
import { Booking } from '../entities/booking.entity';
import { MockPaymentRepository } from '../../test/mocks/payment/payment.repository';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: LoggerService,
          useValue: MockLoggerService
        },
        {
          provide: PaymentDriver,
          useClass: MockPayDriver
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: MockPaymentRepository
        }
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should correctly initialize payment', async () => {
    const booking = new Booking();
    booking.reference = 'refNo';
    expect(await service.initializePayment({
      email: 'test@test.com',
      amount: 1500,
      booking: booking
    })).toMatchObject({
      url: 'http://paystack.com',
      accessCode: 'code',
      reference: 'refNo'
    });
  });

  it('should correctly verify payment', async () => {
    expect(await service.verifyPayment('refno')).toBeTruthy();
  })

  it('should throw error when payment verification fails', async () => {
    await expect(service.verifyPayment('refFalse')).rejects.toThrow(/Verification Error/);
  })
});
