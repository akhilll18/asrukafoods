import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { 
  ArrowForward, 
  LocalShipping, 
  Security, 
  Support, 
  Verified,
  Restaurant,
  People,
  EmojiEmotions,
  CheckCircle,
  Star,
  Favorite,
  Fastfood,
  NoFood,
  HealthAndSafety,
  Agriculture,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';

const HomePage = () => {
  const theme = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(8); // Increased to 8 for 2 rows of 4

        if (productsError) throw productsError;

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .limit(4);

        if (categoriesError) throw categoriesError;

        setFeaturedProducts(productsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Trust badges data
  const trustBadges = [
    { 
      icon: <Agriculture sx={{ fontSize: 40 }} />, 
      title: '100% Natural', 
      desc: 'No artificial colours or flavours',
      color: '#22c55e',
    },
    { 
      icon: <NoFood sx={{ fontSize: 40 }} />, 
      title: 'No Preservatives', 
      desc: 'Pure & authentic ingredients',
      color: '#d97706',
    },
    { 
      icon: <HealthAndSafety sx={{ fontSize: 40 }} />, 
      title: 'Hygiene Certified', 
      desc: 'Prepared with utmost care',
      color: '#3b82f6',
    },
    { 
      icon: <EmojiEmotions sx={{ fontSize: 40 }} />, 
      title: 'Happy Customers', 
      desc: '1000+ satisfied families',
      color: '#8b5cf6',
    },
  ];

  // Stats data
  const stats = [
    { number: '5000+', label: 'Happy Customers', icon: <People /> },
    { number: '50+', label: 'Authentic Recipes', icon: <Restaurant /> },
    { number: '100%', label: 'Natural Ingredients', icon: <CheckCircle /> },
    { number: '4.8', label: 'Average Rating', icon: <Star /> },
  ];

  return (
    <Box>
      {/* ============================================
      HERO SECTION - Full Screen with Background Image
      ============================================ */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '90vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.4)',
            transform: 'scale(1.05)',
          },
        }}
      >
        {/* Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center' }}
          >
            {/* Main Heading */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem' },
                fontWeight: 800,
                fontFamily: "'Poppins', sans-serif",
                lineHeight: 1.1,
                mb: 2,
                color: '#ffffff',
                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              }}
            >
              Taste the <br />
              <span style={{ color: '#d97706' }}>Authentic Flavors</span>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: { xs: '1rem', md: '1.3rem' },
                lineHeight: 1.8,
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Discover the rich taste of traditional recipes made with 100% natural ingredients. 
              Every bite tells a story of authenticity and passion.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: '#d97706',
                  color: '#fff',
                  py: 1.5,
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#b86505' },
                }}
              >
                Explore Menu
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  px: 4,
                  py: 1.5,
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#d97706',
                    bgcolor: 'rgba(217,119,6,0.15)',
                  },
                }}
              >
                Order Now
              </Button>
            </Box>

            {/* Quick Stats on Hero */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 3, md: 6 },
                mt: 6,
                flexWrap: 'wrap',
              }}
            >
              {stats.map((stat, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#d97706',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ============================================
      WHY CHOOSE US - Trust Badges Section
      ============================================ */}
      <Box sx={{ py: 8, bgcolor: '#ffffff' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="overline"
              sx={{
                color: '#d97706',
                fontWeight: 600,
                letterSpacing: '3px',
                textAlign: 'center',
                display: 'block',
              }}
            >
              Why Choose Us
            </Typography>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.8rem' },
              }}
            >
              Pure. Natural. <span style={{ color: '#d97706' }}>Authentic.</span>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}
            >
              We believe in bringing you the true taste of India with ingredients that are
              pure, natural, and free from any artificial additives.
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {trustBadges.map((badge, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      height: '100%',
                      borderRadius: 4,
                      border: '2px solid #f5f5f5',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: badge.color,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <Box sx={{ color: badge.color, mb: 2 }}>{badge.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {badge.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {badge.desc}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============================================
      CATEGORIES SECTION - Modern Grid with Images
      ============================================ */}
      {categories.length > 0 && (
        <Box sx={{ py: 8, bgcolor: '#faf8f5' }}>
          <Container maxWidth="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: '#d97706',
                  fontWeight: 600,
                  letterSpacing: '3px',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Categories
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.8rem' },
                }}
              >
                Explore Our <span style={{ color: '#d97706' }}>Menu</span>
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}
              >
                From traditional pickles to healthy bowls - find your favorite dish
              </Typography>
            </motion.div>

            <Grid container spacing={3}>
              {categories.map((category, index) => (
                <Grid key={category.id} size={{ xs: 6, sm: 3 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      component={Link}
                      to={`/products?category=${category.slug}`}
                      sx={{
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${['#fbbf24', '#f59e0b', '#d97706', '#b86505'][index % 4]}, ${['#d97706', '#b86505', '#92400e', '#78350f'][index % 4]})`,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <Box sx={{ textAlign: 'center', color: '#fff', p: 3 }}>
                        <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>
                          {category.icon || '🍽️'}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                          {category.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Explore Now →
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ============================================
      FEATURED PRODUCTS - 4 Cards per Row
      ============================================ */}
      <Box sx={{ py: 8, bgcolor: '#ffffff' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="overline"
              sx={{
                color: '#d97706',
                fontWeight: 600,
                letterSpacing: '3px',
                textAlign: 'center',
                display: 'block',
              }}
            >
              Our Collection
            </Typography>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.8rem' },
              }}
            >
              Featured <span style={{ color: '#d97706' }}>Dishes</span>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}
            >
              Loved across India for authentic taste and quality ingredients.
            </Typography>
          </motion.div>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#d97706' }} />
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {featuredProducts.map((product, index) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              size="large"
              sx={{
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#d97706',
                  color: '#d97706',
                  bgcolor: 'rgba(217,119,6,0.05)',
                },
              }}
            >
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ============================================
      STATS/ACHIEVEMENTS SECTION
      ============================================ */}
      <Box sx={{ py: 8, bgcolor: '#faf8f5' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              { number: '5000+', label: 'Happy Customers Served', icon: <People sx={{ fontSize: 50 }} /> },
              { number: '50+', label: 'Authentic Recipes', icon: <Restaurant sx={{ fontSize: 50 }} /> },
              { number: '100%', label: 'Natural Ingredients', icon: <Agriculture sx={{ fontSize: 50 }} /> },
              { number: '4.9', label: 'Customer Rating', icon: <Star sx={{ fontSize: 50 }} /> },
            ].map((stat, index) => (
              <Grid key={index} size={{ xs: 6, md: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: '#d97706', mb: 1 }}>{stat.icon}</Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: '#1a1a1a',
                        fontSize: { xs: '2rem', md: '3rem' },
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============================================
      NEWSLETTER / CTA SECTION
      ============================================ */}
      <Box sx={{ py: 8, bgcolor: '#1a1a1a', color: '#ffffff' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center' }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              🍽️ Get Special Offers
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 4,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Subscribe for exclusive deals, new menu updates, and special discounts.
              Join 5000+ happy food lovers!
            </Typography>
            <Box
              component="form"
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#d97706',
                  color: '#fff',
                  px: 6,
                  py: 1.5,
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': { bgcolor: '#b86505' },
                }}
              >
                Subscribe Now
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;