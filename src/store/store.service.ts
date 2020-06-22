import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/createProduct.dto';
import { LoggerService } from '../logger/logger.service';
import { StoreCategory } from '../entities/storeCategory.entity';
import { BuyProductsDto } from './dto/buyproducts.dto';
import { CartItem } from '../entities/cartItem.entity';
import { StoreTransaction } from '../entities/storeTransaction.entity';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(StoreCategory) private categoryRepository: Repository<StoreCategory>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(CartItem) private cartItemRepository: Repository<CartItem>,
        @InjectRepository(StoreTransaction) private storeTransaction: Repository<StoreTransaction>,
        private paymentService: PaymentService,
        private logger: LoggerService
    ) {}

    async findAll() {
        return await this.categoryRepository.find({relations: ['products']}).catch(e => {
            throw e;
        })
    }

    async buyProducts(data: BuyProductsDto) {
        // generate price
        const products = await this.productRepository.findByIds(data.selectedProducts.map(item => {
            return item.id
        }))

        /**
         * inefficient
         */
        const totalPrice = products.reduce((acc, curr) => {
            const totalItemPrice = (curr.price * ((100 - curr.discount)/100) * data.selectedProducts.find(item => item.id === curr.id).count);
            return acc + totalItemPrice;
        }, 0)

        // store cart
        const cartItems = data.selectedProducts.map((item) => {
            const cartItem = new CartItem();
            cartItem.count = item.count
            cartItem.product = products.find(product => product.id === item.id)   
            this.cartItemRepository.save(cartItem);
            return cartItem;
        })

        // initialize transaction
        const payment = await this.paymentService.initializePayment({
            email: data.email,
            amount: totalPrice * 100
        }).catch(e => {
            console.log(e)
        })


        const storeTransaction = new StoreTransaction();
        storeTransaction.amount = totalPrice;
        storeTransaction.cartItems = cartItems;
        storeTransaction.email = data.email;
        storeTransaction.name = data.name;
        if(payment) {
            storeTransaction.reference = payment.reference;
            storeTransaction.payment = payment.paymentEntity;
        }
        const result = await this.storeTransaction.save(storeTransaction);

        return {
            paymentUrl: payment ? payment.url : null,
            reference: result.reference
        }

    }

    async verify(reference: string) {
        const result = {
            verified: false,
            status: 'failed',
            errors: []
        }

        const verified = await this.paymentService.verifyPayment(reference);
        result.verified = verified.success;
        result.status = verified.status;

        const transaction = await this.storeTransaction.findOne({
            where: {
                reference: reference
            },
            relations: ['cartItems']
        });

        let totalRefund = 0;

        if(verified.status === 'success') {

             for(let i = 0; i < transaction.cartItems.length; i++) {
                const element = transaction.cartItems[i];
                const product = await this.productRepository.findOne(element.productId)
                if(product.count < element.count) {
                    totalRefund += (product.price * ((100 - product.discount)/100)) * element.count;
                    result.errors.push({code: 'LTAVAIL', message: `Sorry we have less than your requested amount of ${product.name} available, A refund has been initiated`});
                } else {
                    product.count = product.count - element.count;
                    await this.productRepository.save(product);
                }
            };
        } else {
            return result
        }

        let refund;

        if(totalRefund !== 0) {
            refund = await this.paymentService.refundPayment(reference, totalRefund * 100, `Item(s) were already purchased by someone else while transaction with reference ${reference} was being processed`).catch(e => {
                this.logger.error(e)
            })
        }

        transaction.amountPaid = transaction.amount - totalRefund;
        transaction.amountRefunded = totalRefund;

        if (refund) {
            transaction.refundStatus = refund.status
            result.status = refund.status;
        }

        this.storeTransaction.save(transaction);

        return result;
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

        const category = await this.categoryRepository.findOne(product.storeCategoryId);

        const newProduct = new Product();
        newProduct.name = product.name
        newProduct.imageUrl = product.imageUrl
        newProduct.price = product.price
        newProduct.count = product.count
        newProduct.storeCategory = category

        await this.productRepository.save(newProduct).catch(e => {
            this.logger.error(`Product creation ${product.name}`, e.stack);
            throw e;
        })

        return true;
    }
}
