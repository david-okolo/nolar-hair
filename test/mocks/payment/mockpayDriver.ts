

import { PaymentDriver } from "../../../src/payment/interface/payment-driver.interface";
import { 
    IPaymentInitializeArg,
    IPaymentInitializeResult,
    IPaymentVerifyResult
} from "../../../src/payment/interface/payment.interface";

export class MockPayDriver extends PaymentDriver {

    name = 'MockPay';
    
    async initialize(data: IPaymentInitializeArg) {

        const result: IPaymentInitializeResult = {
            url: 'http://paystack.com',
            accessCode: 'code',
            reference: data.booking.reference
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