import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Rating,
  Chip,
} from '@mui/material';
import { Favorite, Delete, ShoppingCart, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFavourites } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const FavouritesPage = () => {
  const navigate = useNavigate();
  const { favourites, loading, removeFavourite, isFavourite } = useFavourites();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(favourites);
  }, [favourites]);

  const handleRemoveFavourite = (productId) => {
    removeFavourite(productId);
  };

  const handleAddToCart = (product) => {
    const variant = product.variants?.[0] || { weight: '', price: product.price };
    addToCart(product, variant, 1);
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
      <Container maxWidth="xl">
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
              My Favourites
            </Typography>
            <Chip
              label={`${products.length} items`}
              size="small"
              sx={{ bgcolor: '#d97706', color: '#fff' }}
            />
          </Box>

          {products.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Favorite sx={{ fontSize: 60, color: '#d97706', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Favourites Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start adding your favourite dishes to this list!
              </Typography>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                sx={{ bgcolor: '#d97706' }}
              >
                Explore Menu
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      {/* Remove Favourite Button */}
                      <IconButton
                        onClick={() => handleRemoveFavourite(product.id)}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 1,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'rgba(255,0,0,0.1)' },
                        }}
                      >
                        <Delete color="error" />
                      </IconButton>

                      {/* Product Image */}
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                        alt={product.name}
                        sx={{
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/product/${product.id}`)}
                      />

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" color="#d97706" fontWeight={600}>
                          {product.category}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { color: '#d97706' },
                            mb: 0.5,
                          }}
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Rating value={product.rating || 4.5} size="small" readOnly />
                          <Typography variant="caption" color="text.secondary">
                            ({product.reviews || 0})
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                          <Typography variant="h6" color="#d97706" fontWeight={700}>
                            ₹{product.price?.toLocaleString()}
                          </Typography>
                          {product.discount_price && (
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                              ₹{product.discount_price?.toLocaleString()}
                            </Typography>
                          )}
                        </Box>

                        {product.is_best_seller && (
                          <Chip
                            label="⭐ Best Seller"
                            size="small"
                            sx={{ bgcolor: '#d97706', color: '#fff', mb: 1 }}
                          />
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.in_stock === false}
                          sx={{
                            bgcolor: '#1a1a1a',
                            borderRadius: '50px',
                            '&:hover': { bgcolor: '#d97706' },
                            '&.Mui-disabled': { bgcolor: '#e5e5e5', color: '#999' },
                          }}
                        >
                          {product.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default FavouritesPage;