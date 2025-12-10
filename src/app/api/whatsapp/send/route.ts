import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappLog from '@/models/WhatsappLog';
import { randomUUID } from 'crypto';

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const ALLOWED_MESSAGE_TYPES = ['booking_confirmation', 'reminder', 'pickup_notification'];
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authentication check
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { to, message, templateName, parameters, orderId, messageType } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient phone number is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    // Validate E.164 phone format
    if (!E164_REGEX.test(to)) {
      return NextResponse.json(
        { 
          error: 'Phone number must be in E.164 format (e.g., +1234567890)', 
          code: 'INVALID_PHONE_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Validate either message or templateName is provided
    if (!message && !templateName) {
      return NextResponse.json(
        { 
          error: 'Either message or templateName must be provided', 
          code: 'MISSING_MESSAGE_CONTENT' 
        },
        { status: 400 }
      );
    }

    // Validate message if provided
    if (message && typeof message === 'string' && message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty', code: 'EMPTY_MESSAGE' },
        { status: 400 }
      );
    }

    // Validate templateName if provided
    if (templateName && typeof templateName === 'string' && templateName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Template name cannot be empty', code: 'EMPTY_TEMPLATE_NAME' },
        { status: 400 }
      );
    }

    // Validate messageType
    if (!messageType) {
      return NextResponse.json(
        { error: 'Message type is required', code: 'MISSING_MESSAGE_TYPE' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MESSAGE_TYPES.includes(messageType)) {
      return NextResponse.json(
        { 
          error: `Message type must be one of: ${ALLOWED_MESSAGE_TYPES.join(', ')}`, 
          code: 'INVALID_MESSAGE_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate orderId if provided
    if (orderId !== undefined && orderId !== null) {
      const orderIdNum = parseInt(String(orderId));
      if (isNaN(orderIdNum) || orderIdNum <= 0) {
        return NextResponse.json(
          { error: 'Order ID must be a positive integer', code: 'INVALID_ORDER_ID' },
          { status: 400 }
        );
      }
    }

    let whatsappMessageId: string;
    let logStatus: string;
    let logErrorMessage: string | null = null;

    // Check if WhatsApp API is configured
    const isWhatsAppConfigured = WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID;

    if (!isWhatsAppConfigured) {
      // Mock WhatsApp sending
      whatsappMessageId = 'wamid_mock_' + randomUUID();
      logStatus = 'sent';

      // Insert log record
      const logRecord = await WhatsappLog.create({
        messageId: whatsappMessageId,
        recipientPhone: to,
        messageText: message || `Template: ${templateName}`,
        templateName: templateName || null,
        messageType,
        status: logStatus,
        orderId: orderId || null,
        errorMessage: null,
        sentAt: new Date(),
        deliveredAt: null,
        readAt: null,
      });

      return NextResponse.json({
        success: true,
        messageId: whatsappMessageId,
        mock: true,
        logId: logRecord._id.toString(),
      }, { status: 200 });
    }

    // Send via WhatsApp Cloud API
    try {
      const whatsappEndpoint = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

      let requestBody: any;

      if (templateName) {
        // Using template
        const templateComponents = parameters && Array.isArray(parameters) && parameters.length > 0
          ? [{
              type: 'body',
              parameters: parameters.map(p => ({ type: 'text', text: String(p) }))
            }]
          : [];

        requestBody = {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName.trim(),
            language: {
              code: 'en'
            },
            ...(templateComponents.length > 0 && { components: templateComponents })
          }
        };
      } else {
        // Using text message
        requestBody = {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: {
            body: message.trim()
          }
        };
      }

      const whatsappResponse = await fetch(whatsappEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await whatsappResponse.json();

      if (!whatsappResponse.ok) {
        throw new Error(responseData.error?.message || 'WhatsApp API request failed');
      }

      // Extract messageId from response
      whatsappMessageId = responseData.messages?.[0]?.id;
      if (!whatsappMessageId) {
        throw new Error('No message ID returned from WhatsApp API');
      }

      logStatus = 'sent';

      // Insert successful log record
      const logRecord = await WhatsappLog.create({
        messageId: whatsappMessageId,
        recipientPhone: to,
        messageText: message || `Template: ${templateName}`,
        templateName: templateName || null,
        messageType,
        status: logStatus,
        orderId: orderId || null,
        errorMessage: null,
        sentAt: new Date(),
        deliveredAt: null,
        readAt: null,
      });

      return NextResponse.json({
        success: true,
        messageId: whatsappMessageId,
        logId: logRecord._id.toString(),
      }, { status: 200 });

    } catch (whatsappError: any) {
      // WhatsApp API error - insert failed log record
      const mockFailedMessageId = 'wamid_failed_' + randomUUID();
      logStatus = 'failed';
      logErrorMessage = whatsappError.message || 'Unknown error';

      const logRecord = await WhatsappLog.create({
        messageId: mockFailedMessageId,
        recipientPhone: to,
        messageText: message || `Template: ${templateName}`,
        templateName: templateName || null,
        messageType,
        status: logStatus,
        orderId: orderId || null,
        errorMessage: logErrorMessage,
        sentAt: new Date(),
        deliveredAt: null,
        readAt: null,
      });

      return NextResponse.json(
        { 
          error: 'Failed to send WhatsApp message', 
          code: 'WHATSAPP_ERROR',
          details: logErrorMessage,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('POST /api/whatsapp/send error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}