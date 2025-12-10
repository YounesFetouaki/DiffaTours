import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderId = formData.get('oid') as string;
    const response = formData.get('Response') as string;
    const errMsg = formData.get('ErrMsg') as string;

    console.log('Payment failed callback:', { orderId, response, errMsg });

    // Redirect to payment page with error
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'fr';
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/payment/${orderId}?error=${encodeURIComponent(errMsg || 'Payment failed')}`);
  } catch (error) {
    console.error('Fail callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/fr`);
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('oid');
  const errMsg = request.nextUrl.searchParams.get('ErrMsg');
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'fr';
  
  if (orderId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/payment/${orderId}?error=${encodeURIComponent(errMsg || 'Payment failed')}`);
  }
  
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}`);
}
