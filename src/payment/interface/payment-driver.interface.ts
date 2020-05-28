import { IPaymentInitializeArg, IPaymentInitializeResult, IPaymentVerifyResult } from "./payment.interface";

export abstract class PaymentDriver {
    name: string
    abstract async initialize(data: IPaymentInitializeArg): Promise<IPaymentInitializeResult>
    abstract async verify(reference: string): Promise<IPaymentVerifyResult>
}
