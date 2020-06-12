import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/createProduct.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Product) private productRepository: Repository<Product>,
        private paymentService: PaymentService,
        private logger: LoggerService
    ) {}

    async findAll() {
        return await this.productRepository.find().catch(e => {
            throw e;
        })
    }

    async createProduct(product: CreateProductDto) {
        const existingProduct = await this.productRepository.findOne({
            where: {
                name: product.name
            }
        }).catch(e => {
            this.logger.error(`Product creation ${product.name}`, e.stack)
        });

        if (existingProduct) {
            throw new BadRequestException('Identically named product already exists.')
        }

        await this.productRepository.insert(product).catch(e => {
            this.logger.error(`Product creation ${product.name}`, e.stack);
            throw e;
        })

        return true;
    }
}
