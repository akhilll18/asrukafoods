import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
} from '@mui/material';
import { Close, Delete, Add, Remove } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop';

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          bgcolor: '#ffffff',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Your Cart ({totalItems})
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">Your cart is empty</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Browse our products and add items you love
              </Typography>
              <Button
                variant="contained"
                onClick={() => { onClose(); navigate('/products'); }}
                sx={{ mt: 3, bgcolor: '#d97706', '&:hover': { bgcolor: '#b86505' } }}
              >
                Start Shopping
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {items.map((item) => (
                <ListItem
                  key={item.cartKey}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    bgcolor: '#fafafa',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={item.image || FALLBACK_IMAGE}
                      variant="rounded"
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mr: 1,
                        bgcolor: '#f5f5f5',
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary">
                          {item.weight || ''} • ₹{item.price}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            sx={{ border: '1px solid #e5e5e5', borderRadius: 1, width: 28, height: 28 }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            sx={{ border: '1px solid #e5e5e5', borderRadius: 1, width: 28, height: 28 }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" fontWeight={600} sx={{ ml: 1 }}>
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                  <IconButton size="small" onClick={() => removeFromCart(item.cartKey)}>
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {items.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2" fontWeight={600}>₹{totalPrice.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Delivery</Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                {totalPrice > 500 ? 'Free' : '₹40'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>Total</Typography>
              <Typography variant="h6" fontWeight={700} color="#d97706">
                ₹{(totalPrice + (totalPrice > 500 ? 0 : 40)).toLocaleString()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={handleCheckout}
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
            <Button
              variant="text"
              fullWidth
              onClick={clearCart}
              sx={{
                mt: 1,
                color: '#ef4444',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(239,68,68,0.05)' },
              }}
            >
              Clear Cart
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;