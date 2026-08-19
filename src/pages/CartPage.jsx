import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from '@mui/material';
import { Delete, Add, Remove, ShoppingCart as CartIcon, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, deliveryCharge, grandTotal, updateQuantity, removeFromCart, clearCart, isEmpty } = useCart();

  if (isEmpty) {
    return (
      <Box sx={{ py: 8, bgcolor: '#fafafa', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CartIcon sx={{ fontSize: 80, color: '#d97706', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added any items to your cart yet.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/products"
              sx={{
                bgcolor: '#1a1a1a',
                '&:hover': { bgcolor: '#d97706' },
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                textTransform: 'none',
              }}
            >
              Start Shopping
            </Button>
          </Box>
        </Container>
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
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              mb: 1,
            }}
          >
            Your Cart
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You have {totalItems} items in your cart
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, overflow: 'auto' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.cartKey} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={item.image}
                                variant="rounded"
                                sx={{ width: 60, height: 60 }}
                              />
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.weight || ''} - ₹{item.price.toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                                sx={{ border: '1px solid #e5e5e5', borderRadius: 1, width: 30, height: 30 }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 600 }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                                sx={{ border: '1px solid #e5e5e5', borderRadius: 1, width: 30, height: 30 }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight={600}>
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => removeFromCart(item.cartKey)}
                              sx={{ color: '#ef4444' }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/products"
                    sx={{ textTransform: 'none', borderRadius: '50px' }}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="text"
                    onClick={clearCart}
                    sx={{ color: '#ef4444', textTransform: 'none' }}
                  >
                    Clear Cart
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal ({totalItems} items)
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{totalPrice.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Delivery Charge
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {deliveryCharge === 0 ? (
                      <span style={{ color: '#22c55e' }}>Free</span>
                    ) : (
                      `₹${deliveryCharge.toLocaleString()}`
                    )}
                  </Typography>
                </Box>

                {totalPrice > 500 && (
                  <Chip
                    label="🎉 Free Delivery"
                    size="small"
                    sx={{ bgcolor: '#22c55e', color: '#fff', mt: 1, mb: 2 }}
                  />
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={700} color="#d97706">
                    ₹{grandTotal.toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/checkout')}
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: '#1a1a1a',
                    color: '#fff',
                    py: 1.5,
                    borderRadius: '50px',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#d97706' },
                  }}
                >
                  Proceed to Checkout
                </Button>

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

export default CartPage;