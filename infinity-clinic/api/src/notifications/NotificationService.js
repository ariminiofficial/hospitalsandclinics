/**
 * NotificationService interface — WhatsApp and other channels plug in here later.
 * All call sites use notify() without knowing the channel implementation.
 */
export class NotificationService {
  async sendAppointmentConfirmation() {
    // no-op for now
  }

  async sendAppointmentReminder() {
    // no-op for now
  }

  async sendTokenReady() {
    // no-op for now
  }
}

export const notificationService = new NotificationService();
