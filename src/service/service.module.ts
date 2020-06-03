import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../entities/service.entity';
import { ServiceController } from './service.controller';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports:[TypeOrmModule.forFeature([Service]), LoggerModule],
  providers: [ServiceService],
  controllers: [ServiceController]
})
export class ServiceModule {}
