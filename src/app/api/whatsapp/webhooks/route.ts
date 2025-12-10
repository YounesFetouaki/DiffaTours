import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import WhatsappLog from '@/models/WhatsappLog';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    console.log('WhatsApp webhook verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  } catch (error) {
    console.error('GET webhook verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Extract status update from webhook payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const statuses = value?.statuses?.[0];

    if (!statuses) {
      console.log('No status update found in webhook payload');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const messageId = statuses.id;
    const webhookStatus = statuses.status;
    const timestamp = statuses.timestamp;
    const recipientId = statuses.recipient_id;
    const errors = statuses.errors;

    if (!messageId) {
      console.log('No messageId found in webhook payload');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Map webhook status to our database status
    const statusMap: Record<string, string> = {
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
    };

    const mappedStatus = statusMap[webhookStatus] || webhookStatus;

    // Query for existing log entry
    const existingLog = await WhatsappLog.findOne({ messageId });

    if (!existingLog) {
      console.log(`WhatsApp log not found for messageId: ${messageId}`);
      return NextResponse.json({ 
        success: true, 
        messageId, 
        status: mappedStatus 
      }, { status: 200 });
    }

    // Build update object
    const updateData: Record<string, any> = {
      status: mappedStatus,
      updatedAt: new Date(),
    };

    // Update deliveredAt timestamp if status is delivered and not already set
    if (mappedStatus === 'delivered' && !existingLog.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    // Update readAt timestamp if status is read and not already set
    if (mappedStatus === 'read' && !existingLog.readAt) {
      updateData.readAt = new Date();
    }

    // Handle failed status with error message
    if (mappedStatus === 'failed') {
      const errorMessage = errors?.[0]?.message || 'Message delivery failed';
      updateData.errorMessage = errorMessage;
    }

    // Update the database record
    await WhatsappLog.findOneAndUpdate(
      { messageId },
      updateData,
      { new: true }
    );

    console.log('WhatsApp log updated:', {
      messageId,
      status: mappedStatus,
      recipientId,
      timestamp,
      updates: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      messageId, 
      status: mappedStatus 
    }, { status: 200 });

  } catch (error) {
    console.error('POST webhook processing error:', error);
    // Always return 200 to acknowledge webhook even if processing fails
    return NextResponse.json({ 
      success: true 
    }, { status: 200 });
  }
}