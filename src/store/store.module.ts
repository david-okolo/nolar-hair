import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { PaymentModule } from '../payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { LoggerModule } from '../logger/logger.module';
import { StoreCategory } from '../entities/storeCategory.entity';
import { CartItem } from '../entities/cartItem.entity';
import { StoreTransaction } from '../entities/storeTransaction.entity';

@Module({
  imports: [PaymentModule, TypeOrmModule.forFeature([Product, StoreCategory, CartItem, StoreTransaction]), LoggerModule],
  controllers: [StoreController],
  providers: [StoreService]
})
export class StoreModule {}
