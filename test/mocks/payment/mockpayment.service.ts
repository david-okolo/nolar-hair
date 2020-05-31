export const MockPaymentService = {
    initializePayment: async () => {
      return {
        url: 'http://paystack.com',
        accessCode: 'acode',
        reference: 'refNo'
      }
    },
    verifyPayment: async (ref: string) => {

      switch (ref) {
        case 'refError':
            throw new Error('Payment verification error');
        default:
            return true;
      }
    }
  }