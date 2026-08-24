import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { createOrder, checkPincodeAvailability } from '../services/orderService';
import RazorpayPayment from '../components/payment/RazorpayPayment'; // ADD THIS IMPORT

const steps = ['Delivery Details', 'Payment Method', 'Review Order'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { items, totalPrice, deliveryCharge, grandTotal, clearCart, isEmpty } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pincodeValid, setPincodeValid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    fullName: profile?.name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    address: profile?.address?.street || '',
    city: profile?.address?.city || '',
    state: profile?.address?.state || '',
    pincode: profile?.address?.pincode || '',
    landmark: profile?.address?.landmark || '',
    orderNote: '',
  });

  useEffect(() => {
    if (isEmpty) {
      navigate('/products');
      toast.error('Your cart is empty');
    }
  }, [isEmpty, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'pincode') {
      setPincodeValid(null);
    }
  };

  const validatePincode = async () => {
    if (formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    const result = await checkPincodeAvailability(formData.pincode);
    setLoading(false);

    if (result.success) {
      setPincodeValid(result);
      if (result.available) {
        toast.success('✅ Delivery available in your area!');
      } else {
        toast.error('❌ Delivery not available in this area');
      }
    } else {
      toast.error('Failed to check pincode');
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const required = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
      const missing = required.filter(field => !formData[field]);
      if (missing.length > 0) {
        toast.error('Please fill in all required fields.');
        return;
      }

      if (!pincodeValid?.available) {
        toast.error('Please validate your pincode first');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const orderData = {
        total: grandTotal,
        subtotal: totalPrice,
        deliveryCharge: deliveryCharge,
        customer: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email || 'customer@example.com',
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            landmark: formData.landmark || '',
          },
        },
        items: items.map(item => ({
          id: item.productId,
          name: item.name,
          weight: item.weight || '',
          quantity: item.quantity,
          price: item.price,
        })),
        orderNote: formData.orderNote || '',
        paymentMethod: paymentMethod,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        clearCart();
        navigate('/order-confirmation', {
          state: {
            orderId: result.orderId,
            order: result.order,
            paymentMethod: paymentMethod,
          },
        });
      } else {
        toast.error(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                disabled={!!user?.email}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                label="Delivery Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete delivery address"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                required
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <TextField
                  required
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit pincode"
                  inputProps={{ maxLength: 6 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={validatePincode}
                  disabled={loading || formData.pincode.length < 6}
                  sx={{ mt: 1, borderRadius: '50px' }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Check Availability'}
                </Button>
                {pincodeValid && (
                  <Chip
                    label={pincodeValid.available ? '✅ Delivery Available' : '❌ Not Available'}
                    color={pincodeValid.available ? 'success' : 'error'}
                    size="small"
                    sx={{ mt: 1, ml: 1 }}
                  />
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Any landmark near your location"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
                Select Payment Method
              </FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {/* COD Option */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    cursor: 'pointer',
                    borderColor: paymentMethod === 'cod' ? '#d97706' : '#e0e0e0',
                    bgcolor: paymentMethod === 'cod' ? 'rgba(217,119,6,0.05)' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: '#d97706' },
                  }}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <FormControlLabel
                    value="cod"
                    control={<Radio sx={{ color: '#d97706', '&.Mui-checked': { color: '#d97706' } }} />}
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          📦 Cash on Delivery
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pay when you receive your order
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                {/* Razorpay Option */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderColor: paymentMethod === 'razorpay' ? '#d97706' : '#e0e0e0',
                    bgcolor: paymentMethod === 'razorpay' ? 'rgba(217,119,6,0.05)' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: '#d97706' },
                  }}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <FormControlLabel
                    value="razorpay"
                    control={<Radio sx={{ color: '#d97706', '&.Mui-checked': { color: '#d97706' } }} />}
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          💳 Online Payment (Razorpay)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pay with Card, UPI, Net Banking, or Wallets
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>

            <Alert severity="info" sx={{ mt: 3 }}>
              {paymentMethod === 'cod'
                ? '📦 Pay when you receive your order. No online payment required.'
                : '🔒 Secure payment via Razorpay. We accept all major cards, UPI, and Net Banking.'}
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            {/* Items */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Items ({items.length})
              </Typography>
              {items.map((item) => (
                <Box key={item.cartKey} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2">
                    {item.name} {item.weight && `(${item.weight})`} × {item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">₹{totalPrice.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Delivery</Typography>
                <Typography variant="body2" color="success.main">
                  {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={700} color="#d97706">
                  ₹{grandTotal.toLocaleString()}
                </Typography>
              </Box>
            </Paper>

            {/* Delivery Details */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Delivery Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2">
                <strong>{formData.fullName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.address}, {formData.city}, {formData.state} - {formData.pincode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📞 {formData.phone}
              </Typography>
              {formData.landmark && (
                <Typography variant="body2" color="text.secondary">
                  📍 Landmark: {formData.landmark}
                </Typography>
              )}
            </Paper>

            {paymentMethod === 'cod' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Cash on Delivery: Please keep exact change ready at the time of delivery.
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              You will receive order confirmation via email and SMS.
            </Alert>

            {/* ============================================
            PAYMENT BUTTON - COD or RAZORPAY
            ============================================ */}
            {paymentMethod === 'razorpay' ? (
              <RazorpayPayment
                amount={grandTotal}
                customerName={formData.fullName}
                phone={formData.phone}
                email={formData.email}
                address={`${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`}
                items={items}
                onSuccess={() => {}}
                onError={() => {}}
              />
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={handlePlaceOrder}
                disabled={loading}
                sx={{
                  mt: 2,
                  bgcolor: '#d97706',
                  color: '#fff',
                  py: 1.5,
                  borderRadius: '50px',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#b86505' },
                  '&.Mui-disabled': { bgcolor: '#e5e5e5', color: '#999' },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Place Order • ₹${grandTotal.toLocaleString()}`
                )}
              </Button>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Checkout
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                {getStepContent(activeStep)}

                {activeStep < 2 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      sx={{ borderRadius: '50px' }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{
                        bgcolor: '#1a1a1a',
                        borderRadius: '50px',
                        px: 4,
                        '&:hover': { bgcolor: '#333' },
                      }}
                    >
                      Continue
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {items.slice(0, 3).map((item) => (
                  <Box key={item.cartKey} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">
                      {item.name} {item.weight && `(${item.weight})`} × {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
                {items.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{items.length - 3} more items
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">₹{totalPrice.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Delivery</Typography>
                  <Typography variant="body2" color="success.main">
                    {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                  </Typography>
                </Box>
                {totalPrice > 500 && (
                  <Chip
                    label="🎉 Free Delivery"
                    size="small"
                    sx={{ bgcolor: '#22c55e', color: '#fff', mb: 1 }}
                  />
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={700} color="#d97706">
                    ₹{grandTotal.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    🔒 Secure Checkout
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    🚚 Free Delivery above ₹500
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CheckoutPage;