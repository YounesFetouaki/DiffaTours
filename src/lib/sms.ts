import { connectDB } from '@/lib/mongodb';
import SmsLog from '@/models/SmsLog';
import SmsPreference from '@/models/SmsPreference';

export interface SendSMSParams {
  phoneNumber: string;
  messageBody: string;
  messageType: 'booking_confirmation' | 'reminder_24h' | 'pickup_notification';
  orderId?: number;
  scheduledFor?: Date;
}

export interface SMSResult {
  success: boolean;
  messageSid?: string;
  logId?: string;
  error?: string;
  mock?: boolean;
}

/**
 * Send an SMS message via Twilio or queue it for later
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResult> {
  const { phoneNumber, messageBody, messageType, orderId, scheduledFor } = params;

  try {
    await connectDB();

    // If scheduled for future, queue it
    if (scheduledFor && scheduledFor > new Date()) {
      const queuedLog = await SmsLog.create({
        messageSid: null,
        orderId: orderId || null,
        phoneNumber: phoneNumber.trim(),
        messageBody: messageBody.trim(),
        messageType,
        status: 'queued',
        scheduledFor,
        sentAt: null,
      });

      return {
        success: true,
        logId: queuedLog._id.toString()
      };
    }

    // Check Twilio configuration
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const isTwilioConfigured = twilioAccountSid && twilioAuthToken && twilioPhoneNumber;

    if (!isTwilioConfigured) {
      // Mock SMS sending for development
      const mockSid = `mock_sid_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const mockLog = await SmsLog.create({
        messageSid: mockSid,
        orderId: orderId || null,
        phoneNumber: phoneNumber.trim(),
        messageBody: messageBody.trim(),
        messageType,
        status: 'sent',
        scheduledFor: null,
        sentAt: new Date(),
      });

      console.log(`[SMS Mock] Sent to ${phoneNumber}: ${messageBody}`);

      return {
        success: true,
        messageSid: mockSid,
        logId: mockLog._id.toString(),
        mock: true
      };
    }

    // Send via Twilio
    const twilio = require('twilio');
    const client = twilio(twilioAccountSid, twilioAuthToken);

    const message = await client.messages.create({
      body: messageBody.trim(),
      from: twilioPhoneNumber,
      to: phoneNumber.trim()
    });

    const twilioLog = await SmsLog.create({
      messageSid: message.sid,
      orderId: orderId || null,
      phoneNumber: phoneNumber.trim(),
      messageBody: messageBody.trim(),
      messageType,
      status: 'sent',
      scheduledFor: null,
      sentAt: new Date(),
    });

    return {
      success: true,
      messageSid: message.sid,
      logId: twilioLog._id.toString(),
      mock: false
    };
  } catch (error: any) {
    console.error('SMS send error:', error);

    // Log failed attempt
    try {
      await connectDB();
      const failedLog = await SmsLog.create({
        messageSid: null,
        orderId: orderId || null,
        phoneNumber: phoneNumber.trim(),
        messageBody: messageBody.trim(),
        messageType,
        status: 'failed',
        scheduledFor: null,
        sentAt: null,
        errorCode: error.code?.toString() || 'UNKNOWN',
        errorMessage: error.message || 'Failed to send SMS',
      });

      return {
        success: false,
        logId: failedLog._id.toString(),
        error: error.message || 'Failed to send SMS'
      };
    } catch (logError) {
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }
}

/**
 * Check if user has SMS notifications enabled for a specific type
 */
export async function checkSMSPreferences(
  userId: string,
  messageType: 'booking_confirmation' | 'reminder_24h' | 'pickup_notification'
): Promise<boolean> {
  try {
    await connectDB();
    const preferences = await SmsPreference.findOne({ userId });

    // If no preferences found, default to enabled
    if (!preferences) {
      return true;
    }

    // Map message types to preference fields
    switch (messageType) {
      case 'booking_confirmation':
        return preferences.bookingConfirmations;
      case 'reminder_24h':
        return preferences.reminders;
      case 'pickup_notification':
        return preferences.pickupNotifications;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking SMS preferences:', error);
    return false;
  }
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmation(params: {
  phoneNumber: string;
  orderId: number;
  customerName: string;
  excursionName: string;
  date: string;
  participants: number;
  totalPrice: number;
  userId?: string;
}): Promise<SMSResult> {
  const { phoneNumber, orderId, customerName, excursionName, date, participants, totalPrice, userId } = params;

  // Check preferences if userId provided
  if (userId) {
    const enabled = await checkSMSPreferences(userId, 'booking_confirmation');
    if (!enabled) {
      return { success: false, error: 'SMS notifications disabled by user' };
    }
  }

  const message = `Bonjour ${customerName},\n\nVotre réservation #${orderId} est confirmée!\n\n${excursionName}\nDate: ${date}\nParticipants: ${participants}\nTotal: ${totalPrice} MAD\n\nMerci de votre confiance!`;

  return sendSMS({
    phoneNumber,
    messageBody: message,
    messageType: 'booking_confirmation',
    orderId
  });
}

/**
 * Schedule a reminder SMS for 24 hours before the excursion
 */
export async function scheduleReminder(params: {
  phoneNumber: string;
  orderId: number;
  customerName: string;
  excursionName: string;
  pickupTime: string;
  pickupLocation: string;
  excursionDate: Date;
  userId?: string;
}): Promise<SMSResult> {
  const { phoneNumber, orderId, customerName, excursionName, pickupTime, pickupLocation, excursionDate, userId } = params;

  // Check preferences if userId provided
  if (userId) {
    const enabled = await checkSMSPreferences(userId, 'reminder_24h');
    if (!enabled) {
      return { success: false, error: 'SMS reminders disabled by user' };
    }
  }

  // Schedule for 24 hours before excursion
  const reminderDate = new Date(excursionDate);
  reminderDate.setHours(reminderDate.getHours() - 24);

  const message = `Rappel: Votre excursion "${excursionName}" est demain!\n\nHeure de ramassage: ${pickupTime}\nLieu: ${pickupLocation}\n\nRéservation #${orderId}\n\nÀ bientôt ${customerName}!`;

  return sendSMS({
    phoneNumber,
    messageBody: message,
    messageType: 'reminder_24h',
    orderId,
    scheduledFor: reminderDate
  });
}

/**
 * Send pickup notification SMS
 */
export async function sendPickupNotification(params: {
  phoneNumber: string;
  orderId: number;
  customerName: string;
  excursionName: string;
  pickupTime: string;
  pickupLocation: string;
  userId?: string;
}): Promise<SMSResult> {
  const { phoneNumber, orderId, customerName, excursionName, pickupTime, pickupLocation, userId } = params;

  // Check preferences if userId provided
  if (userId) {
    const enabled = await checkSMSPreferences(userId, 'pickup_notification');
    if (!enabled) {
      return { success: false, error: 'SMS pickup notifications disabled by user' };
    }
  }

  const message = `Bonjour ${customerName},\n\nNotre équipe arrive bientôt!\n\n${excursionName}\nHeure: ${pickupTime}\nLieu: ${pickupLocation}\n\nRéservation #${orderId}\n\nPréparez-vous!`;

  return sendSMS({
    phoneNumber,
    messageBody: message,
    messageType: 'pickup_notification',
    orderId
  });
}