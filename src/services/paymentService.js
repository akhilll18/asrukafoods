// src/services/paymentService.js
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

// ============================================
// CREATE ORDER IN SUPABASE
// ============================================
export const createOrder = async (orderData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Please login to place order');
      return { success: false, error: 'Not authenticated' };
    }

    const orderId = `ORD_${Date.now()}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        customer: orderData.customer,
        items: orderData.items,
        subtotal: orderData.subtotal,
        delivery_charge: orderData.deliveryCharge || 0,
        total: orderData.total,
        order_note: orderData.orderNote || '',
        payment_method: orderData.paymentMethod || 'razorpay',
        status: 'pending',
        payment_status: 'pending',
        tracking: {
          updates: [{
            status: 'pending',
            location: 'Order Placed',
            note: 'Your order has been placed successfully',
            timestamp: new Date().toISOString(),
          }],
        },
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      orderId: data.order_id,
      order: data,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// UPDATE ORDER PAYMENT STATUS
// ============================================
export const updateOrderPayment = async (orderId, paymentId, status) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: status === 'success' ? 'paid' : 'failed',
        payment_id: paymentId,
        status: status === 'success' ? 'confirmed' : 'pending',
        tracking: {
          updates: [{
            status: status === 'success' ? 'confirmed' : 'pending',
            location: status === 'success' ? 'Payment Confirmed' : 'Payment Failed',
            note: status === 'success' ? 'Payment received successfully' : 'Payment failed',
            timestamp: new Date().toISOString(),
          }],
        },
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, order: data };
  } catch (error) {
    console.error('Error updating order payment:', error);
    return { success: false, error: error.message };
  }
};