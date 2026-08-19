import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  IconButton,
} from '@mui/material';
import { Add, Remove, ShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useFavourites } from '../../context/FavouritesContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();
  
  const defaultVariant = product.variants?.[0] || { weight: '', price: product.price };
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [isHovered, setIsHovered] = useState(false);
  
  const cartKey = `${product.id}-${selectedVariant.weight}`;
  const cartItem = items.find(item => item.cartKey === cartKey);
  const isInCart = !!cartItem;
  const isFav = isFavourite(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, 1);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleToggleFavourite = (e) => {
    e.stopPropagation();
    toggleFavourite(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '1px solid #f0f0f0',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            borderColor: '#d97706',
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Favourite Button */}
        <IconButton
          onClick={handleToggleFavourite}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
          }}
        >
          {isFav ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>

        {/* Product Image */}
        <Box onClick={handleCardClick}>
          <CardMedia
            component="img"
            height="220"
            image={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={product.name}
            sx={{ 
              objectFit: 'cover',
              backgroundColor: '#f5f5f5',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            }}
          />
          
          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {product.is_featured && (
              <Chip 
                label="FEATURED" 
                size="small" 
                sx={{ 
                  bgcolor: '#d97706', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: '9px',
                  height: 20,
                }} 
              />
            )}
            {product.is_best_seller && (
              <Chip 
                label="BEST SELLER" 
                size="small" 
                sx={{ 
                  bgcolor: '#22c55e', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: '9px',
                  height: 20,
                }} 
              />
            )}
            {product.in_stock === false && (
              <Chip 
                label="OUT OF STOCK" 
                size="small" 
                sx={{ 
                  bgcolor: '#ef4444', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: '9px',
                  height: 20,
                }} 
              />
            )}
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          {/* Category */}
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#d97706', 
              fontWeight: 600, 
              letterSpacing: '1px', 
              textTransform: 'uppercase',
              mb: 0.5,
              fontSize: '10px',
            }}
          >
            {product.category}
          </Typography>
          
          {/* Product Name */}
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '1rem', 
              mb: 0.5, 
              lineHeight: 1.3,
              cursor: 'pointer',
              '&:hover': { color: '#d97706' },
              minHeight: '48px',
            }}
            onClick={handleCardClick}
          >
            {product.name}
          </Typography>
          
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Rating value={product.rating || 4.5} precision={0.1} size="small" readOnly />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
              ({product.reviews || 0})
            </Typography>
          </Box>

          {/* Price & Weight */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.1rem' }}>
              ₹{selectedVariant.price?.toLocaleString()}
            </Typography>
            {product.discount_price && (
              <Typography variant="body2" sx={{ color: '#999', textDecoration: 'line-through', fontSize: '0.8rem' }}>
                ₹{product.discount_price?.toLocaleString()}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {selectedVariant.weight}
            </Typography>
          </Box>

          {/* Weight Selector */}
          {product.variants && product.variants.length > 1 && (
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
              {product.variants.map((variant) => (
                <Button
                  key={variant.weight}
                  variant={selectedVariant.weight === variant.weight ? 'contained' : 'outlined'}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVariantChange(variant);
                  }}
                  sx={{
                    minWidth: 'auto',
                    px: 1.2,
                    py: 0.3,
                    fontSize: '0.7rem',
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: selectedVariant.weight === variant.weight ? '#d97706' : '#d0d0d0',
                    bgcolor: selectedVariant.weight === variant.weight ? '#d97706' : 'transparent',
                    color: selectedVariant.weight === variant.weight ? '#fff' : '#666',
                    '&:hover': {
                      borderColor: '#d97706',
                      bgcolor: selectedVariant.weight === variant.weight ? '#b86505' : 'rgba(217,119,6,0.05)',
                    },
                  }}
                >
                  {variant.weight}
                </Button>
              ))}
            </Box>
          )}

          {/* Add to Cart / Go to Cart */}
          {isInCart ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                component={motion.button}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/cart');
                }}
                sx={{ 
                  flex: 1,
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#d97706',
                  '&:hover': { bgcolor: '#b86505' },
                  py: 0.8,
                  fontSize: '0.8rem',
                }}
              >
                Go to Cart
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(cartKey, cartItem.quantity - 1);
                  }}
                  sx={{ 
                    border: '1px solid #e5e5e5', 
                    borderRadius: 1,
                    width: 28,
                    height: 28,
                  }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <Typography sx={{ minWidth: 24, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                  {cartItem.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(cartKey, cartItem.quantity + 1);
                  }}
                  sx={{ 
                    border: '1px solid #e5e5e5', 
                    borderRadius: 1,
                    width: 28,
                    height: 28,
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={!product.in_stock && product.in_stock !== undefined}
              sx={{
                bgcolor: '#1a1a1a',
                color: '#fff',
                borderRadius: '50px',
                py: 0.8,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.85rem',
                '&:hover': { bgcolor: '#d97706' },
                '&.Mui-disabled': { bgcolor: '#e5e5e5', color: '#999' },
              }}
            >
              {product.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;