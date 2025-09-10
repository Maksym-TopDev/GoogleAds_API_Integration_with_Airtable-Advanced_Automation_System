// Jest setup

try {
  jest.mock('nodemailer', () => ({
    createTransport: () => ({
      sendMail: jest.fn().mockResolvedValue(true)
    })
  }));
} catch (e) {
  // ignore if not installed
}
