export const MockPaymentRepository = {
    findOne: async (condition) => {
      return {
        id: 1,
        authorizationUrl: 'https://checkout.paystack.com',
        success: true,
        verified: true,
        reference: condition.reference,
        amount: 2000,
        bookingId: 1,
        booking: {
          id: 1,
          reference: condition.reference,
          name: 'Test',
          email: 'test@test.com',
          requestedAppointmentTime: 1591009200000,
          approvedAppointmentTime: 1591005600000,
          service: 'Barbing',
          paidRequest: true,
          payment: null
        }
      }
    },
    save: async () => {
      return true;
    },
    update: async (condition) => {
      if(condition.reference === 'refFalse') {
        throw new Error('(Verification Error)');
      }
    }
  }