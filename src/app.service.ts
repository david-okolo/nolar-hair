import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(private logger: LoggerService) {}
  getHello(): string {
    return 'Hello World!';
  }
}
