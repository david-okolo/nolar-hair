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

    async checkBooking(reference) {

        const response = {
            email: 'test@test.com',
            paid: true,
            status: 'confirmed',
            timeSlot: '11:00 AM',
            date: '2020-05-30',
            service: 'Barbing',
            errors: []
        };

        if(reference === 'refPaid') {
            return response;
        } else if(reference === 'refNo') {
            response.paid = false;
            response.status = 'pending';
            return response;
        } else {
            return {
            errors: ['Booking does not exist']
            }
        }
    }
  }