import Paystack from 'paystack';

import { PaymentDriver } from "../interface/payment-driver.interface";
import { 
    IPaymentInitializeArg,
    IPaymentInitializeResult,
    IPaymentVerifyResult
} from "../interface/payment.interface";
import { ConfigService } from '@nestjs/config';
import { OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

export class PaystackDriver extends PaymentDriver implements OnModuleInit {

    paystack;

    constructor(
        @Inject(forwardRef(() => ConfigService)) private configService: ConfigService,
        private logger: LoggerService
    ) {
        super();
    }

    onModuleInit() {
        const key = this.configService.get<string>('PAYSTACK_SECRET_KEY');
        this.paystack = Paystack(key);
    }

    name = 'PAYSTACK';
    
    async initialize(data: IPaymentInitializeArg) {

        const result: IPaymentInitializeResult = {
            url: '',
            accessCode: '',
            reference: ''
        }

        const init = await this.paystack.transaction.initialize({
            email: data.email,
            amount: data.amount,
            reference: data.booking.reference
        }).catch(e => {
            this.logger.error(e.message, e.stack);
        });

        if(init && init.status) {
            result.url = init.data.authorization_url;
            result.accessCode = init.data.access_code;
            result.reference = init.data.reference;
        } else if(init) {
            throw new Error(init.message)
        } else {
            throw new Error('Payment initialization failed')
        }

        return result;
    }

    async verify(reference: string) {

        const result: IPaymentVerifyResult = {
            currency: 'NGN',
            amount: 500,
            status: true,
            date: '01/11/2020'
        }

        const res = await this.paystack.transaction.verify(reference).catch((e: Error) => {
            // if the call fails log it. the variable 'res' would be set to null
            this.logger.error(e.message, e.stack);
        });

        if(res && res.status) {
            result.amount = res.data.amount;
            result.currency = res.data.currency;
            result.status = res.data.status === 'success' ? true : false;
            result.date = res.data.transaction_date;
        } else {
            // either the api call fails or it responds with a bad request object
            throw new Error('Payment verification failed');
        }

        return result;
    }
}