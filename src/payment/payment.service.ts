import { Injectable } from '@nestjs/common';
import { PaymentDriver } from './interface/payment-driver.interface';
import { IPaymentInitializeArg, IPaymentInitializeResult } from './interface/payment.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PaymentService {

    driverName: string;

    constructor(
        private driver: PaymentDriver,
        @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
        private logger: LoggerService
    ) {
        this.driverName = this.driver.name;
        this.logger.setContext('Payment Service');
    }

    async initializePayment(data: IPaymentInitializeArg): Promise<IPaymentInitializeResult> | null{
        const initResult = await this.driver.initialize(data).catch(e => {
            throw e;
        });

        let payment: Payment;
        if(initResult)
        {
            payment = await this.paymentRepository.save({
                authorizationUrl: initResult.url,
                booking: data?.booking,
                reference: initResult.reference,
                amount: data.amount
            }).catch(e => {
                throw e;
            });
            initResult.paymentEntity = payment;
        }

        return initResult || null;
    }

    async verifyPayment(reference: string): Promise<{
        success: boolean
        status: string
    }> {

        const verification = await this.driver.verify(reference).catch(e => {
            throw e;
        });

        if(verification && verification.status === 'success') {
            await this.paymentRepository.update(
                { 
                    reference: reference
                },
                {
                    verified: true,
                    success: true
                }
            ).catch(e => {
                throw e;
            });

            return {
                success: true,
                status: verification.status
            };
        } else if (verification) {
            return {
                success: true,
                status: verification.status
            }
        }

        return {
            success: false,
            status: 'failed'
        };
    }

    async refundPayment(reference: string, amount: number, reason: string) {

        
        const payment = await this.paymentRepository.findOne({
            where: {
                reference
            }
        }).catch(e => {
            this.logger.error(e)
            throw e;
        })

        if(payment && payment.refundInit === false) {
            const response = await this.driver.refund(reference, amount, reason).catch(e => {
                throw e;
            });

            if(response.status) {
                payment.refundInit = true
                this.paymentRepository.save(payment)
            }

            return {
                ...response,
                message: 'Refund Initialized'
            }
        } else if(payment) {
            return {
                status: 'failed',
                message: 'Refund has already been initialized'
            }
        }

        // if(verification && verification.status) {
        //     await this.paymentRepository.update(
        //         { 
        //             reference: reference
        //         },
        //         {
        //             verified: true,
        //             success: true
        //         }
        //     ).catch(e => {
        //         throw e;
        //     });

        //     return true;
        // }

        return {
            status: 'failed',
            message: 'Refund failed'
        };
    }
}
