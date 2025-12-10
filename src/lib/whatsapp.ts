import { WhatsAppClient, WhatsAppClientError } from './whatsapp/client';
import { PhoneNumberValidator } from './whatsapp/phone';

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v19.0';

interface WhatsAppMessage {
  to: string;
  message?: string;
  templateName?: string;
  languageCode?: string;
  parameters?: string[];
  orderId?: number;
  messageType: 'booking_confirmation' | 'reminder' | 'pickup_notification';
}

/**
 * Check if WhatsApp API is configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Get WhatsApp client instance
 */
function getWhatsAppClient(): WhatsAppClient {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WhatsApp API not configured');
  }

  return new WhatsAppClient(
    WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_API_TOKEN,
    WHATSAPP_API_VERSION,
  );
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsApp(data: WhatsAppMessage): Promise<{ messageId: string; mock?: boolean }> {
  // Validate phone number
  const validation = PhoneNumberValidator.validate(data.to, 'MA');
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid phone number');
  }

  const formattedPhone = validation.formatted!;

  // If WhatsApp is not configured, use mock mode
  if (!isWhatsAppConfigured()) {
    console.log('[WhatsApp Mock] Sending message:', {
      to: formattedPhone,
      message: data.message,
      templateName: data.templateName,
      messageType: data.messageType,
    });

    return {
      messageId: `wamid_mock_${Date.now()}`,
      mock: true,
    };
  }

  try {
    const client = getWhatsAppClient();

    let result: { messageId: string };

    if (data.templateName) {
      result = await client.sendTemplate(
        formattedPhone,
        data.templateName,
        data.languageCode || 'fr',
        data.parameters,
      );
    } else if (data.message) {
      result = await client.sendMessage(formattedPhone, data.message);
    } else {
      throw new Error('Either message or templateName must be provided');
    }

    return result;
  } catch (error) {
    if (error instanceof WhatsAppClientError) {
      console.error('[WhatsApp Error]', {
        message: error.message,
        statusCode: error.statusCode,
        retryable: error.retryable,
      });
      throw error;
    }
    throw error;
  }
}

/**
 * Check user's WhatsApp notification preferences
 */
export async function checkWhatsAppPreferences(userId: string): Promise<{
  enabled: boolean;
  phoneNumber: string | null;
  bookingConfirmations: boolean;
  reminders: boolean;
  pickupNotifications: boolean;
}> {
  try {
    const response = await fetch(`/api/whatsapp/preferences/${userId}`);
    if (!response.ok) {
      return {
        enabled: true,
        phoneNumber: null,
        bookingConfirmations: true,
        reminders: true,
        pickupNotifications: true,
      };
    }

    const prefs = await response.json();
    return {
      enabled: prefs.notificationsEnabled ?? true,
      phoneNumber: prefs.phoneNumber || null,
      bookingConfirmations: prefs.bookingConfirmations ?? true,
      reminders: prefs.reminders ?? true,
      pickupNotifications: prefs.pickupNotifications ?? true,
    };
  } catch (error) {
    console.error('Error checking WhatsApp preferences:', error);
    return {
      enabled: true,
      phoneNumber: null,
      bookingConfirmations: true,
      reminders: true,
      pickupNotifications: true,
    };
  }
}

/**
 * Send booking confirmation WhatsApp
 */
export async function sendBookingConfirmationWhatsApp(data: {
  phoneNumber: string;
  orderId: number;
  orderNumber: string;
  excursionName: string;
  excursionDate: string;
  participants: number;
  totalPrice: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const message = `🎉 Confirmation de réservation

Numéro de commande: ${data.orderNumber}

Excursion: ${data.excursionName}
Date: ${data.excursionDate}
Participants: ${data.participants}
Total: ${data.totalPrice}

Merci d'avoir réservé avec Dar Rita! Nous avons hâte de vous accueillir.

Pour toute question, contactez-nous au +212 XXX XXX XXX`;

    const result = await sendWhatsApp({
      to: data.phoneNumber,
      message,
      messageType: 'booking_confirmation',
      orderId: data.orderId,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('Error sending booking confirmation WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Schedule WhatsApp reminder (24h before excursion)
 */
export async function scheduleWhatsAppReminder(data: {
  phoneNumber: string;
  orderId: number;
  excursionName: string;
  excursionDate: string;
  pickupTime?: string;
  pickupLocation?: string;
}): Promise<{ success: boolean; scheduledId?: number; error?: string }> {
  try {
    // Calculate reminder time (24h before excursion)
    const excursionDateTime = new Date(data.excursionDate);
    const reminderTime = new Date(excursionDateTime.getTime() - 24 * 60 * 60 * 1000);

    const message = `⏰ Rappel: Votre excursion demain!

Excursion: ${data.excursionName}
Date: ${data.excursionDate}
${data.pickupTime ? `Heure de prise en charge: ${data.pickupTime}` : ''}
${data.pickupLocation ? `Lieu: ${data.pickupLocation}` : ''}

N'oubliez pas d'apporter:
- Votre confirmation de réservation
- Une pièce d'identité
- Crème solaire et chapeau

À demain! 🌟`;

    const response = await fetch('/api/whatsapp/scheduled', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_phone: data.phoneNumber,
        message,
        message_type: 'reminder',
        scheduled_time: reminderTime.toISOString(),
        order_id: data.orderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to schedule WhatsApp reminder');
    }

    const result = await response.json();

    return {
      success: true,
      scheduledId: result.scheduled_id,
    };
  } catch (error) {
    console.error('Error scheduling WhatsApp reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send pickup notification WhatsApp
 */
export async function sendPickupNotificationWhatsApp(data: {
  phoneNumber: string;
  orderId: number;
  excursionName: string;
  driverName?: string;
  vehicleInfo?: string;
  eta?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const message = `🚗 Votre chauffeur est en route!

Excursion: ${data.excursionName}
${data.driverName ? `Chauffeur: ${data.driverName}` : ''}
${data.vehicleInfo ? `Véhicule: ${data.vehicleInfo}` : ''}
${data.eta ? `Arrivée estimée: ${data.eta}` : ''}

Veuillez être prêt à l'heure de prise en charge.

Bon voyage! 🌟`;

    const result = await sendWhatsApp({
      to: data.phoneNumber,
      message,
      messageType: 'pickup_notification',
      orderId: data.orderId,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('Error sending pickup notification WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
