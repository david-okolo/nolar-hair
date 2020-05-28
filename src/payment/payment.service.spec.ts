import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { MockPayDriver } from './drivers/mockpayDriver';
import { PaymentDriver } from './interface/payment-driver.interface';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentDriver,
          useClass: MockPayDriver
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            insert: async () => {
              return true;
            },
            update: async () => {
              return true;
            }
          }
        }
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should correctly initialize payment', async () => {
    expect(await service.initializePayment({
      email: 'test@test.com',
      amount: 1500
    })).toMatchObject({
      url: 'http://paystack.com',
      accessCode: 'code',
      reference: 'refno'
    });
  });

  it('should correctly verify payment', async () => {
    expect(await service.verifyPayment('refno')).toMatchObject({
      currency: 'NGN',
      amount: 500,
      status: true,
      date: '01/11/2020'
    });
  })

  it('should throw error when payment verification fails', async () => {
    await expect(service.verifyPayment('refFalse')).rejects.toThrow(/Verification Error/);
  })
});
