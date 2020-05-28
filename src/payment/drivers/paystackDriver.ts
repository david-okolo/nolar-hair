

import { PaymentDriver } from "../interface/payment-driver.interface";
import { 
    IPaymentInitializeArg,
    IPaymentInitializeResult,
    IPaymentVerifyResult
} from "../interface/payment.interface";

export class PaystackDriver extends PaymentDriver {

    name = 'PAYSTACK';
    
    async initialize(data: IPaymentInitializeArg) {

        const result: IPaymentInitializeResult = {
            url: 'http://paystack.com',
            accessCode: 'code',
            reference: 'refno'
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

        return result;
    }
}