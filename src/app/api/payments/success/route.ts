import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const orderId = formData.get('oid') as string;
    const response = formData.get('Response') as string;

    console.log('Payment success callback:', { orderId, response });

    // Update order status and payment info
    try {
      await Order.findOneAndUpdate(
        { orderNumber: orderId },
        { 
          paymentStatus: 'paid',
          status: 'confirmed',
          updatedAt: new Date()
        }
      );

      // Trigger badge generation and email sending
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Call the send confirmation email API (which also generates badge)
      await fetch(`${baseUrl}/api/orders/${orderId}/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error('Failed to send confirmation email:', err));

    } catch (dbError) {
      console.error('Database update error:', dbError);
    }

    // Redirect to order confirmation page
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'fr';
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/order-confirmation/${orderId}?payment=success`);
  } catch (error) {
    console.error('Success callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/fr`);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const orderId = request.nextUrl.searchParams.get('oid');
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'fr';
    
    if (orderId) {
      // Update order status
      try {
        await Order.findOneAndUpdate(
          { orderNumber: orderId },
          { 
            paymentStatus: 'paid',
            status: 'confirmed',
            updatedAt: new Date()
          }
        );

        // Trigger badge generation and email sending
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        await fetch(`${baseUrl}/api/orders/${orderId}/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.error('Failed to send confirmation email:', err));

      } catch (dbError) {
        console.error('Database update error:', dbError);
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/order-confirmation/${orderId}?payment=success`);
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}`);
  } catch (error) {
    console.error('GET error:', error);
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'fr';
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}`);
  }
}