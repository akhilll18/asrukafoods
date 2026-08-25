// src/components/payment/RazorpayPayment.jsx
import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { createOrder, updateOrderPayment } from '../../services/paymentService';
import { toast } from 'react-toastify';

const RazorpayPayment = ({ 
  amount, 
  customerName, 
  phone, 
  email, 
  address,
  items,
  onSuccess,
  onError 
}) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // 2. Create order in Supabase
      const orderData = {
        customer: {
          name: customerName,
          phone: phone,
          email: email || 'customer@example.com',
          address: typeof address === 'string' ? { full: address } : address,
        },
        items: items.map(item => ({
          id: item.productId,
          name: item.name,
          weight: item.weight || '',
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: amount,
        total: amount,
        deliveryCharge: 0,
        orderNote: '',
        paymentMethod: 'razorpay',
      };

      const orderResult = await createOrder(orderData);
      if (!orderResult.success) {
        toast.error(orderResult.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      // 3. Call Supabase Edge Function to create Razorpay order
      const response = await fetch('https://umbtlmjexvryjuuvemjf.supabase.co/functions/v1/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          receipt: orderResult.orderId,
        }),
      });

      const razorpayOrder = await response.json();
      if (!razorpayOrder.success) {
        toast.error('Failed to create payment order');
        setLoading(false);
        return;
      }

      // 4. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Asruka-Foods',
        description: `Order ${orderResult.orderId}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: customerName,
          email: email || 'customer@example.com',
          contact: phone,
        },
        notes: {
          order_id: orderResult.orderId,
        },
        theme: {
          color: '#d97706',
        },
        handler: async (response) => {
          // Payment successful
          try {
            await updateOrderPayment(orderResult.orderId, response.razorpay_payment_id, 'success');
            toast.success('Payment successful! 🎉');
            clearCart();
            if (onSuccess) onSuccess(response);
            navigate('/order-confirmation', {
              state: {
                orderId: orderResult.orderId,
                paymentId: response.razorpay_payment_id,
                paymentMethod: 'razorpay',
              },
            });
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed');
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      if (onError) onError(error);
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        fullWidth
        onClick={handlePayment}
        disabled={loading}
        sx={{
          bgcolor: '#1a1a1a',
          color: '#fff',
          py: 1.5,
          borderRadius: '50px',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          '&:hover': { bgcolor: '#d97706' },
          '&.Mui-disabled': { bgcolor: '#e5e5e5', color: '#999' },
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Pay ₹${amount?.toLocaleString()} securely`
        )}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        🔒 Secured by Razorpay
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: '#666' }}>💳 Cards</Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>📱 UPI</Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>🏦 Net Banking</Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>👛 Wallets</Typography>
      </Box>
    </Box>
  );
};

export default RazorpayPayment;