export interface IPaymentInitializeResult {
    url: string
    accessCode: string
    reference: string
}

export interface IPaymentInitializeArg {
    email: string
    amount: number
    reference?: string
    callbackUrl?: string
}

export interface IPaymentVerifyResult {
    currency: string
    amount: number
    date: string
    status: boolean
}