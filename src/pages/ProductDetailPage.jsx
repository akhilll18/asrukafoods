import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Rating,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AddShoppingCart, ArrowBack, Add, Remove, Favorite, FavoriteBorder, Share, LocalOffer } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/product/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch product
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setProduct(data);
        
        // Set default variant
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        } else {
          setSelectedVariant({ weight: '', price: data.price });
        }

        // Fetch related products (same category)
        if (data.category) {
          const { data: related, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(4);

          if (!relatedError) {
            setRelatedProducts(related || []);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleToggleFavourite = () => {
    if (!product) return;
    toggleFavourite(product);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on Asruka-Foods!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#d97706' }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h5" gutterBottom>Product not found</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            sx={{ mt: 2, bgcolor: '#1a1a1a' }}
          >
            Back to Products
          </Button>
        </Container>
      </Box>
    );
  }

  const isInCart = items.some(item => 
    item.productId === product.id && 
    (item.variant?.weight === selectedVariant?.weight || (!item.variant && !selectedVariant?.weight))
  );

  return (
    <Box sx={{ py: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3, textTransform: 'none' }}
          >
            Back
          </Button>

          <Grid container spacing={4}>
            {/* Product Images */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Box
                  component="img"
                  src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 500,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
              </Paper>
            </Grid>

            {/* Product Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                {/* Category */}
                <Typography variant="overline" sx={{ color: '#d97706', fontWeight: 600, letterSpacing: '1px' }}>
                  {product.category}
                </Typography>

                {/* Name */}
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {product.name}
                </Typography>

                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Rating value={product.rating || 4.5} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({product.reviews || 0} reviews)
                  </Typography>
                </Box>

                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    ₹{selectedVariant?.price?.toLocaleString() || product.price?.toLocaleString()}
                  </Typography>
                  {product.discount_price && (
                    <Typography variant="h6" sx={{ color: '#999', textDecoration: 'line-through' }}>
                      ₹{product.discount_price?.toLocaleString()}
                    </Typography>
                  )}
                  {product.discount_price && (
                    <Chip
                      label={`Save ${Math.round(((product.discount_price - product.price) / product.discount_price) * 100)}%`}
                      size="small"
                      sx={{ bgcolor: '#22c55e', color: '#fff' }}
                    />
                  )}
                </Box>

                {/* Stock Status */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip
                    label={product.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                    size="small"
                    sx={{
                      bgcolor: product.in_stock !== false ? '#22c55e' : '#ef4444',
                      color: '#fff',
                    }}
                  />
                  {product.is_best_seller && (
                    <Chip label="⭐ Best Seller" size="small" sx={{ bgcolor: '#d97706', color: '#fff' }} />
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Description */}
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#666' }}>
                  {product.description}
                </Typography>

                {/* Ingredients */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Ingredients:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {product.ingredients.map((ingredient, index) => (
                        <Chip key={index} label={ingredient} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Dietary Tags */}
                {product.dietary_tags && product.dietary_tags.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Dietary:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {product.dietary_tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ bgcolor: '#f0f0f0' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Variant Selector */}
                {product.variants && product.variants.length > 1 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Select Size:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {product.variants.map((variant) => (
                        <Button
                          key={variant.weight}
                          variant={selectedVariant?.weight === variant.weight ? 'contained' : 'outlined'}
                          onClick={() => setSelectedVariant(variant)}
                          sx={{
                            borderRadius: '50px',
                            textTransform: 'none',
                            borderColor: selectedVariant?.weight === variant.weight ? '#d97706' : '#d0d0d0',
                            bgcolor: selectedVariant?.weight === variant.weight ? '#d97706' : 'transparent',
                            color: selectedVariant?.weight === variant.weight ? '#fff' : '#666',
                            '&:hover': {
                              borderColor: '#d97706',
                              bgcolor: selectedVariant?.weight === variant.weight ? '#b86505' : 'rgba(217,119,6,0.05)',
                            },
                          }}
                        >
                          {variant.weight} - ₹{variant.price.toLocaleString()}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Preparation Time */}
                {product.preparation_time && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ⏱️ Preparation Time: {product.preparation_time}
                  </Typography>
                )}

                {/* Quantity Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600}>Quantity:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      sx={{ border: '1px solid #e5e5e5', borderRadius: 1 }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(quantity + 1)}
                      sx={{ border: '1px solid #e5e5e5', borderRadius: 1 }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={product.in_stock === false}
                    sx={{
                      flex: 2,
                      bgcolor: isInCart ? '#22c55e' : '#1a1a1a',
                      color: '#fff',
                      py: 1.5,
                      borderRadius: '50px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: isInCart ? '#16a34a' : '#d97706',
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#e5e5e5',
                        color: '#999',
                      },
                    }}
                  >
                    {isInCart ? '✅ Added to Cart' : product.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  
                  <IconButton
                    onClick={handleToggleFavourite}
                    sx={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 2,
                      p: 1.5,
                      '&:hover': { bgcolor: 'rgba(239,68,68,0.05)' },
                    }}
                  >
                    {isFavourite(product.id) ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                  
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 2,
                      p: 1.5,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>

                {/* Trust Badges */}
                <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666' }}>
                    ✅ Fresh Ingredients
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666' }}>
                    🧑‍🍳 Authentic Recipe
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666' }}>
                    🚚 Free Delivery above ₹500
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                You May Also Like
              </Typography>
              <Grid container spacing={1}>
                {relatedProducts.map((product) => (
                  <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;