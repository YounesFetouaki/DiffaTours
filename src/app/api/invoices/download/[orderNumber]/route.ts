import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { generateInvoicePDF } from '@/lib/invoice-generator';

export const maxDuration = 60; // Vercel serverless timeout

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    // Get locale from query params or order
    const queryLocale = request.nextUrl.searchParams.get('locale');

    await connectDB();
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Use query locale, order locale, or default to 'fr'
    const locale = queryLocale || order.locale || 'fr';

    // Parse cart items
    const cartItems = JSON.parse(order.cartItems || '[]');

    // Transform cart items to match PDF generator interface
    const transformedCartItems = cartItems.map((item: any) => {
      // Transform ageGroups from object to array
      const ageGroupsArray = item.ageGroups
        ? Object.entries(item.ageGroups)
          .filter(([_, count]) => (count as number) > 0)
          .map(([ageGroup, count]) => ({
            ageGroup,
            count: count as number,
            price: 0, // Price is already included in total
          }))
        : [];

      return {
        excursionName: item.excursionName || '',
        excursionPrice: item.priceMAD || item.total || 0,
        selectedItems: item.selectedItems || [],
        ageGroups: ageGroupsArray,
      };
    });

    // Generate PDF with locale
    const pdfBuffer = await generateInvoicePDF(
      {
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        phone: order.phone,
        passport: order.passport,
        city: order.city,
        accommodationType: order.accommodationType,
        hotelName: order.hotelName,
        address: order.address,
        cartItems: transformedCartItems,
        totalMad: order.totalMad,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        currency: order.currency,
        exchangeRate: order.exchangeRate,
      },
      locale
    );

    // Return PDF as download
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderNumber}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Invoice download error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}