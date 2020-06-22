import Paystack from 'paystack';
import fetch from 'node-fetch';
import axios from 'axios';

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
            ...data.reference && {reference: data.reference}
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
            status: 'failed',
            date: '01/11/2020'
        }

        const res = await this.paystack.transaction.verify(reference).catch((e: Error) => {
            // if the call fails log it. the variable 'res' would be set to null
            this.logger.error(e.message, e.stack);
        });

        if(res && res.status) {
            result.amount = res.data.amount;
            result.currency = res.data.currency;
            result.status = res.data.status;
            result.date = res.data.transaction_date;
        } else {
            // either the api call fails or it responds with a bad request object
            throw new Error('Payment verification failed');
        }

        return result;
    }

    async refund(reference: string, amount: number, reason) {
        const headers = {
            'Authorization': 'Bearer '+this.configService.get<string>('PAYSTACK_SECRET_KEY'),
            'Content-Type': 'application/json'
        }
        const body = {
            transaction: reference,
            amount: amount, 
            /* eslint-disable */
            merchant_note: reason,
            /* eslint-disable */
            currency: 'NGN'
        };

        const response = await axios.post('https://api.paystack.co/refund', body, {
            headers: headers
        });

        if(response.statusText === 'OK') {
            const { data } = response;
            if(data.status) {
                return {
                    status: data.data.status
                }
            } else {
                throw new Error('Refund Error: Process was unsuccessful for '+reference)
            }
        } else {
            throw new Error('Refund Error: Error contacting paystack')
        }
    }
}