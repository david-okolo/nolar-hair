import { IPaymentInitializeArg, IPaymentInitializeResult, IPaymentVerifyResult } from "./payment.interface";
import { Observable } from 'rxjs';

export abstract class PaymentDriver {
    name: string
    abstract async initialize(data: IPaymentInitializeArg): Promise<IPaymentInitializeResult>
    abstract async verify(reference: string): Promise<IPaymentVerifyResult>
    abstract async refund(reference: string, amount: number, reason: string): Promise<any>
}
