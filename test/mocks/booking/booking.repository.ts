import { Booking } from "../../../src/entities/booking.entity"

export const MockBookingRepository = {
    save: async () => {
      return {
        reference: 'refNo'
      }
    },
    findOne: async (condition) => {
      const result: Booking = {
        id: 1,
        reference: condition.reference,
        name: 'Test',
        email: 'test@test.com',
        requestedAppointmentTime: 1591009200000,
        approvedAppointmentTime: 1591005600000,
        service: 'Barbing',
        paidRequest: true,
        payment: {
          id: 1,
          authorizationUrl: 'https://checkout.paystack.com',
          success: true,
          verified: true,
          reference: condition.reference,
          amount: 2000,
          bookingId: 1,
          booking: null
        }
      }

      switch (condition.reference) {
        case 'refUndefined':
          return null;
        case 'refError':
          result.approvedAppointmentTime = null;
          result.payment.verified = false;
          return result;
        case 'refPaidUnverified':
          result.approvedAppointmentTime = null;
          result.payment.verified = false;
          return result;
        case 'refFreeApproved':
          result.paidRequest = false;
          result.payment = null;
          return result;
        case 'refFreeUnapproved':
          result.approvedAppointmentTime = null;
          result.paidRequest = false;
          result.payment = null;
          return result;
        default:
          return result;
      }
    }
  }