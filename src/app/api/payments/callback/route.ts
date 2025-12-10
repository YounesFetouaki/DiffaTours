import { NextRequest, NextResponse } from 'next/server';
import { getCMIConfig } from '@/lib/cmi';
import { CMIPaymentService } from '@/lib/cmiPayment';

export interface CMICallbackPayload {
  clientid: string;
  amount: string;
  currency: string;
  oid: string;
  tranid?: string;
  Response: string;
  ErrMsg?: string;
  HASH: string;
  AuthCode?: string;
  ProcReturnCode?: string;
  mdStatus?: string;
  rnd?: string;
}

/**
 * CMI Payment Response Codes:
 * Approved = Success
 * Declined = Declined
 * Error = Error
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const body: CMICallbackPayload = {
      clientid: formData.get('clientid') as string,
      amount: formData.get('amount') as string,
      currency: formData.get('currency') as string,
      oid: formData.get('oid') as string,
      tranid: formData.get('tranid') as string,
      Response: formData.get('Response') as string,
      ErrMsg: formData.get('ErrMsg') as string,
      HASH: formData.get('HASH') as string,
      AuthCode: formData.get('AuthCode') as string,
      ProcReturnCode: formData.get('ProcReturnCode') as string,
      mdStatus: formData.get('mdStatus') as string,
      rnd: formData.get('rnd') as string,
    };

    console.log('CMI Callback received:', {
      orderId: body.oid,
      response: body.Response,
      amount: body.amount,
    });

    const config = getCMIConfig();
    const cmiService = new CMIPaymentService(config);

    // Verify signature
    const isValid = cmiService.verifyCallbackSignature(
      body.oid,
      body.amount,
      body.currency,
      body.Response,
      body.HASH
    );

    if (!isValid) {
      console.error('Invalid CMI callback signature:', {
        orderId: body.oid,
        received: body.HASH,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Map response to payment status
    const paymentStatus = body.Response === 'Approved' ? 'success' : 
                         body.Response === 'Declined' ? 'failed' : 'failed';

    // Update payment status in database
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/orders/payment/${body.oid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentStatus: paymentStatus,
        transactionId: body.tranid || null,
        authCode: body.AuthCode || null,
        paymentResponse: `${body.Response}${body.ErrMsg ? ': ' + body.ErrMsg : ''}`,
      }),
    });

    // Auto-send invoice email after successful payment
    if (body.Response === 'Approved') {
      try {
        await fetch(`${baseUrl}/api/invoices/email/${body.oid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: 'fr' }),
        });
        console.log('Invoice email sent automatically for order:', body.oid);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
        // Don't fail the callback if email fails
      }
    }

    // CMI expects ACTION=POSTAUTH response for approved transactions
    if (body.Response === 'Approved') {
      return new NextResponse('ACTION=POSTAUTH', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json({ success: true, status: 'OK' });
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}