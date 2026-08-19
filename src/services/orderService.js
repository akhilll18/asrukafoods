import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Please login to place order');
      return { success: false, error: 'Not authenticated' };
    }

    // Check pincode availability
    const pincode = orderData.customer.address?.pincode;
    if (pincode) {
      const { data: pincodeData, error: pincodeError } = await supabase
        .from('delivery_pincodes')
        .select('delivery_available')
        .eq('pincode', pincode)
        .maybeSingle();

      if (pincodeError) {
        console.error('Pincode check error:', pincodeError);
      }

      if (pincodeData && !pincodeData.delivery_available) {
        toast.error('Delivery not available in your area');
        return { success: false, error: 'Delivery not available' };
      }
    }

    // Generate order ID
    const orderId = `ORD_${Date.now()}`;

    // Create order in Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        customer: orderData.customer,
        items: orderData.items,
        subtotal: orderData.subtotal || orderData.total,
        delivery_charge: orderData.deliveryCharge || 0,
        total: orderData.total,
        order_note: orderData.orderNote || '',
        payment_method: orderData.paymentMethod,
        status: 'pending',
        payment_status: 'pending',
        tracking: {
          updates: [{
            status: 'pending',
            location: 'Order Placed',
            note: 'Your order has been placed successfully',
            timestamp: new Date().toISOString(),
          }],
          delivery_partner: '',
          tracking_id: '',
          estimated_delivery: null,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order');
      return { success: false, error: error.message };
    }

    return {
      success: true,
      orderId: data.order_id,
      order: data,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    toast.error('Something went wrong');
    return { success: false, error: error.message };
  }
};

// Get order tracking
export const getOrderTracking = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, tracking, created_at')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;

    return {
      success: true,
      tracking: {
        status: data.status,
        updates: data.tracking?.updates || [],
        estimatedDelivery: data.tracking?.estimated_delivery,
        createdAt: data.created_at,
      },
    };
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return { success: false, error: error.message };
  }
};

// Get user's orders
export const getUserOrders = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      orders: data,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: error.message };
  }
};

// Check pincode availability
export const checkPincodeAvailability = async (pincode) => {
  try {
    const { data, error } = await supabase
      .from('delivery_pincodes')
      .select('*')
      .eq('pincode', pincode)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return {
        success: true,
        available: false,
        message: 'Delivery not available in this area',
      };
    }

    return {
      success: true,
      available: data.delivery_available,
      data: data,
      message: data.delivery_available ? 'Delivery available' : 'Delivery not available',
    };
  } catch (error) {
    console.error('Error checking pincode:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};