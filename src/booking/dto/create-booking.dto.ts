export class CreateBookingDto {
    name: string
    email: string
    requestedService: string
    requestedAppointmentTime: number
    paidRequest: boolean
}