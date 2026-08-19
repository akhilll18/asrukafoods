import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, Divider, Chip } from '@mui/material';
import { CheckCircle, Email, WhatsApp, Home, Receipt, CalendarToday } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || `ORD_${Date.now()}`;
  const order = location.state?.order || null;
  const paymentMethod = location.state?.paymentMethod || 'cod';
  const isCOD = paymentMethod === 'cod';

  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ py: 8, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box sx={{ mb: 3 }}>
                <CheckCircle sx={{ fontSize: 80, color: '#22c55e' }} />
              </Box>
            </motion.div>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Order Confirmed! 🎉
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              Thank you for your order with Asruka-Foods
            </Typography>

            <Chip
              label={isCOD ? 'Cash on Delivery' : 'Paid Online'}
              color={isCOD ? 'warning' : 'success'}
              size="small"
              sx={{ mt: 1 }}
            />

            {/* Order Details */}
            <Paper
              variant="outlined"
              sx={{ p: 3, mt: 4, mb: 4, textAlign: 'left' }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Order Details
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Receipt sx={{ color: '#d97706' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Order ID
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {orderId}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CalendarToday sx={{ color: '#d97706' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(order?.created_at)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Payment Method
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {isCOD ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isCOD
                  ? 'Pay when you receive your order'
                  : 'Payment already completed'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Delivery Address
              </Typography>
              {order?.customer?.address && (
                <>
                  <Typography variant="body1" fontWeight={500}>
                    {order.customer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customer.address.street}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📞 {order.customer.phone}
                  </Typography>
                </>
              )}
            </Paper>

            {/* What's Next */}
            <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: 'left' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📦 What's Next?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: '#d97706' }}>1.</span>
                  We'll confirm your order within 2 hours
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: '#d97706' }}>2.</span>
                  Your order will be prepared fresh
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: '#d97706' }}>3.</span>
                  Estimated delivery: 30-45 minutes
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: '#d97706' }}>4.</span>
                  Track your order in real-time
                </Typography>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{
                  bgcolor: '#1a1a1a',
                  borderRadius: '50px',
                  px: 4,
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                Go Home
              </Button>
              <Button
                variant="outlined"
                startIcon={<Receipt />}
                onClick={() => navigate('/orders')}
                sx={{
                  borderRadius: '50px',
                  px: 4,
                }}
              >
                View Orders
              </Button>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                href="https://wa.me/919876543210"
                target="_blank"
                sx={{
                  bgcolor: '#25D366',
                  borderRadius: '50px',
                  px: 4,
                  '&:hover': { bgcolor: '#1da851' },
                }}
              >
                WhatsApp Us
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
              A confirmation has been sent to your email and phone
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default OrderConfirmationPage;