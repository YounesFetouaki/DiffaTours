import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Reservation from '@/models/Reservation';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching admin analytics...');

    // Get session from Clerk
    const { userId } = await auth();

    if (!userId) {
      console.log('❌ Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session authenticated:', userId);

    await connectDB();
    console.log('✅ Database connected');

    // Fetch user from database and check admin role
    const user = await User.findOne({ clerkId: userId }).lean();

    if (!user) {
      console.log('❌ User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.email, '| Role:', user.role);

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log(`❌ Unauthorized access attempt by user ${userId} with role: ${user.role}`);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required', code: 'ADMIN_ACCESS_REQUIRED' },
        { status: 403 }
      );
    }

    console.log('✅ Admin access granted');

    // Get all orders
    const orders = await Order.find({}).lean();
    const reservations = await Reservation.find({}).lean();

    console.log(`📦 Loaded ${orders.length} orders and ${reservations.length} reservations`);

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalMad || 0), 0);

    // Count orders by status
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const totalReservations = reservations.length;

    // Revenue by month (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        })
        .reduce((sum, order) => sum + (order.totalMad || 0), 0);
      
      revenueByMonth.push({
        month: monthNames[date.getMonth()],
        revenue: Math.round(monthRevenue)
      });
    }

    // Orders by status
    const ordersByStatus = [
      { status: 'Pending', count: orders.filter(o => o.status === 'pending').length },
      { status: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
      { status: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
      { status: 'Completed', count: orders.filter(o => o.status === 'completed').length }
    ].filter(item => item.count > 0);

    // Top excursions
    const excursionStats: { [key: string]: { bookings: number; revenue: number } } = {};
    
    orders.forEach(order => {
      try {
        const cartItems = typeof order.cartItems === 'string' ? JSON.parse(order.cartItems) : order.cartItems;
        if (Array.isArray(cartItems)) {
          cartItems.forEach((item: any) => {
            const name = item.name || 'Unknown Excursion';
            if (!excursionStats[name]) {
              excursionStats[name] = { bookings: 0, revenue: 0 };
            }
            excursionStats[name].bookings += item.quantity || 1;
            excursionStats[name].revenue += (item.price || 0) * (item.quantity || 1);
          });
        }
      } catch (error) {
        console.error('Error parsing cart items:', error);
      }
    });

    reservations.forEach(reservation => {
      const name = reservation.excursionName || 'Unknown Excursion';
      if (!excursionStats[name]) {
        excursionStats[name] = { bookings: 0, revenue: 0 };
      }
      excursionStats[name].bookings += 1;
      excursionStats[name].revenue += reservation.totalPriceMad || 0;
    });

    const topExcursions = Object.entries(excursionStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by payment method
    const paymentMethodStats: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      const normalizedMethod = method === 'cash' ? 'Cash' : 
                              method === 'cmi' ? 'Card' : 
                              method === 'bank_transfer' ? 'Bank Transfer' : 
                              'Other';
      if (!paymentMethodStats[normalizedMethod]) {
        paymentMethodStats[normalizedMethod] = 0;
      }
      paymentMethodStats[normalizedMethod] += order.totalMad || 0;
    });

    const revenueByPaymentMethod = Object.entries(paymentMethodStats)
      .map(([method, amount]) => ({ method, amount: Math.round(amount) }))
      .sort((a, b) => b.amount - a.amount);

    const analyticsData = {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalReservations,
      pendingOrders,
      confirmedOrders,
      revenueByMonth,
      ordersByStatus,
      topExcursions: topExcursions.map(exc => ({
        ...exc,
        revenue: Math.round(exc.revenue)
      })),
      revenueByPaymentMethod
    };

    console.log('✅ Analytics data prepared successfully');
    console.log(`📊 Total Revenue: ${analyticsData.totalRevenue} MAD`);
    console.log(`📦 Total Orders: ${totalOrders} | Reservations: ${totalReservations}`);

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}