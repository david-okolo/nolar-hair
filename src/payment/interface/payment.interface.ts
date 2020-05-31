import { Booking } from "../../entities/booking.entity";

export interface IPaymentInitializeResult {
    url: string
    accessCode: string
    reference: string
}

export interface IPaymentInitializeArg {
    email: string
    amount: number
    booking: Booking
    callbackUrl?: string
}

export interface IPaymentVerifyResult {
    currency: string
    amount: number
    date: string
    status: boolean
}