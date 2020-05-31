import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { ViewService } from '../view/view.service';
import { MailDriver } from './interface/mailer.interface';

describe('MailerService', () => {
  let service: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        MailerService,
        ViewService,
        {
          provide: MailDriver,
          useValue: {
            getOptions: () => {
              return {};
            }
          }
        }
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
