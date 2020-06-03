export enum BookingStatus {
    pending = 'pending',
    success = 'success',
    failed = 'failed'
}

export interface ICheckBookingResult {
    email: string
    paidRequest: boolean
    paymentStatus: boolean
    timeSlot: string
    service: string
    status: BookingStatus
    errors: string[]
}
