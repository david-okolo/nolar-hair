export const MockMailerService = {
    send: () => {
      return new Promise((resolve, reject) => {
        resolve('Mock mailer');
      })
    }
  }