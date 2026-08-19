import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ExpandMore,
  ShoppingBag,
  Receipt,
  CalendarToday,
  LocalShipping,
  CheckCircle,
  Cancel,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getUserOrders } from '../services/orderService';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await getUserOrders();
    if (result.success) {
      setOrders(result.orders || []);
    } else {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      out_for_delivery: '#d97706',
      delivered: '#22c55e',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    return status?.replace('_', ' ')?.toUpperCase() || 'PENDING';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      paid: '#22c55e',
      failed: '#ef4444',
      refunded: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSteps = (order) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    
    return statusOrder.map((status, index) => ({
      label: getStatusLabel(status),
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#d97706' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ textTransform: 'none' }}
            >
              Back
            </Button>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
              }}
            >
              My Orders
            </Typography>
          </Box>

          {orders.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <ShoppingBag sx={{ fontSize: 60, color: '#d97706', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Orders Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't placed any orders yet. Start exploring our delicious menu!
              </Typography>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                sx={{ bgcolor: '#d97706' }}
              >
                Browse Menu
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {orders.map((order) => (
                <Grid key={order.id} size={{ xs: 12 }}>
                  <Paper>
                    {/* Order Header */}
                    <Box sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Receipt sx={{ color: '#d97706' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Order ID
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {order.order_id}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ color: '#d97706' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Date
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(order.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Chip
                            label={getStatusLabel(order.status)}
                            sx={{
                              bgcolor: getStatusColor(order.status),
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <Typography variant="h6" color="#d97706" fontWeight={700} align="right">
                            ₹{order.total?.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          <Typography variant="body2" color="text.secondary">
                            {order.items?.length || 0} items
                          </Typography>
                          <Chip
                            label={`Payment: ${order.payment_status}`}
                            size="small"
                            sx={{
                              bgcolor: getPaymentStatusColor(order.payment_status),
                              color: '#fff',
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          {/* Items */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Items
                            </Typography>
                            {order.items?.map((item, index) => (
                              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
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
                              <Typography variant="body2">₹{order.subtotal?.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Delivery</Typography>
                              <Typography variant="body2">
                                {order.delivery_charge === 0 ? 'Free' : `₹${order.delivery_charge}`}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>Total</Typography>
                              <Typography variant="subtitle2" fontWeight={700} color="#d97706">
                                ₹{order.total?.toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Tracking */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Order Status
                            </Typography>
                            <Stepper activeStep={getSteps(order).findIndex(s => s.active)} orientation="vertical">
                              {getSteps(order).map((step, index) => (
                                <Step key={index} completed={step.completed}>
                                  <StepLabel
                                    sx={{
                                      '& .MuiStepLabel-label': {
                                        color: step.active ? '#d97706' : 'inherit',
                                        fontWeight: step.active ? 600 : 400,
                                      },
                                    }}
                                  >
                                    {step.label}
                                  </StepLabel>
                                </Step>
                              ))}
                            </Stepper>

                            {/* Tracking Updates */}
                            {order.tracking?.updates && order.tracking.updates.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                  Updates
                                </Typography>
                                {order.tracking.updates.slice().reverse().map((update, index) => (
                                  <Box key={index} sx={{ display: 'flex', gap: 2, py: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                                      {formatDate(update.timestamp)}
                                    </Typography>
                                    <Typography variant="body2">
                                      {update.note || update.status}
                                      {update.location && ` (${update.location})`}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {/* Delivery Details */}
                            {order.customer && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                  Delivery Details
                                </Typography>
                                <Typography variant="body2">
                                  {order.customer.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {order.customer.address?.street}, {order.customer.address?.city}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {order.customer.address?.state} - {order.customer.address?.pincode}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  📞 {order.customer.phone}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default OrdersPage;