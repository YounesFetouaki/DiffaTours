import { NextRequest, NextResponse } from 'next/server';
import { getCMIConfig } from '@/lib/cmi';
import { CMIPaymentService } from '@/lib/cmiPayment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, amount, email, customerName, language } = body;

    // Validate request
    if (!orderNumber || !amount || !email || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: orderNumber, amount, email, customerName' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Update order payment status to processing
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders/payment/${orderNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: 'processing' }),
    });

    const config = getCMIConfig();
    const cmiService = new CMIPaymentService(config);

    // Generate payment redirect
    const payment = await cmiService.initiatePayment({
      orderId: orderNumber,
      amount: amount,
      email: email,
      customerName: customerName,
      language: language || 'fr',
    });

    return NextResponse.json({
      success: true,
      redirectUrl: payment.redirectUrl,
      orderId: payment.orderId,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { 
        error: 'Payment initiation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
