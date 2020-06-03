import { ICheckBookingResult, BookingStatus } from "../../../src/booking/interface/booking.interface";

export class MockBookingService {

    async createBooking () {
        return {
            created: true,
            paymentRequested: true,
            paymentInitialized: true,
            paymentUrl: 'http://paystack.com/',
            reference: 'refNo',
            errors: []
        };
    }

    async checkBooking(reference): Promise<ICheckBookingResult> {

        const response: ICheckBookingResult = {
            email: 'test@test.com',
            paidRequest: true,
            paymentStatus: true,
            status: BookingStatus.success,
            timeSlot: 'Mon Jun 01 2020 11:00:00 GMT+0100 (West Africa Standard Time)',
            service: 'Barbing',
            errors: []
        };

        if(reference === 'refPaid') {
            return response;
        } else if(reference === 'refNo') {
            response.paidRequest = false;
            response.paymentStatus = false;
            response.status = BookingStatus.pending;
            return response;
        } else {
            response.errors.push('Booking does not exist');
            return response;
        }
    }
  }