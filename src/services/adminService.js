import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

// Admin: Get all orders
export const adminGetAllOrders = async (status = null, limit = 50, offset = 0) => {
  try {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      orders: data,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: error.message };
  }
};

// Admin: Update order status
export const adminUpdateOrderStatus = async (orderId, status, note, location) => {
  try {
    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError) throw orderError;

    // Update order
    const updateData = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    // Add tracking update
    const tracking = order.tracking || { updates: [] };
    tracking.updates.push({
      status: status,
      location: location || 'Warehouse',
      note: note || `Order status updated to ${status}`,
      timestamp: new Date().toISOString(),
    });
    updateData.tracking = tracking;

    // If delivered, update payment for COD
    if (status === 'delivered' && order.payment_method === 'cod') {
      updateData.payment_status = 'paid';
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      order: data,
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: error.message };
  }
};

// Admin: Get stats
export const adminGetStats = async () => {
  try {
    // Get all orders
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('status, payment_status, amount, total, payment_method, created_at');

    if (error) throw error;

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
    
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    const processingOrders = allOrders.filter(o => ['confirmed', 'processing'].includes(o.status)).length;
    const completedOrders = allOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = allOrders.filter(o => o.status === 'cancelled').length;
    const paidOrders = allOrders.filter(o => o.payment_status === 'paid').length;
    const pendingPayment = allOrders.filter(o => o.payment_status === 'pending').length;
    const codOrders = allOrders.filter(o => o.payment_method === 'cod').length;
    
    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;

    // Get total customers
    const { count: totalCustomers, error: customerError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (customerError) throw customerError;

    // Average order value
    const averageOrderValue = totalOrders > 0 
      ? allOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0) / totalOrders 
      : 0;

    // Completion rate
    const completionRate = totalOrders > 0 
      ? Math.round((completedOrders / totalOrders) * 100) 
      : 0;

    return {
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        paidOrders,
        pendingPayment,
        codOrders,
        totalCustomers: totalCustomers || 0,
        averageOrderValue,
        completionRate,
        todayOrders,
      },
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: error.message };
  }
};