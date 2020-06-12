import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { Booking } from './entities/booking.entity';
import { Payment } from './entities/payment.entity';
import { LoggerModule } from './logger/logger.module';
import { MailerModule } from './mailer/mailer.module';
import { ViewModule } from './view/view.module';
import { StoreModule } from './store/store.module';
import { Service } from './entities/service.entity';
import { ServiceModule } from './service/service.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { ProductTransaction } from './entities/productTransaction.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './images'
    }),
    LoggerModule,
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [Booking, Payment, Service, User, Product, ProductTransaction],
        synchronize: configService.get<string>('NODE_ENV') === 'production' ? false : true // remove in production
      }),
      inject: [ConfigService]
    }),
    BookingModule,
    PaymentModule,
    MailerModule,
    ViewModule,
    StoreModule,
    ServiceModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
