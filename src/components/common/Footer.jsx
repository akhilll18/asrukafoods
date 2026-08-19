import React from 'react';
import { Box, Container, Typography, Grid, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Instagram, Twitter, YouTube, WhatsApp, LocationOn, Phone, Email } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a',
        color: '#ffffff',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Playfair Display', serif",
                mb: 2,
                color: '#d97706',
              }}
            >
              🍽️ Asruka-Foods
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, lineHeight: 1.8 }}>
              Authentic flavors crafted with love and tradition. 
              Bringing the taste of India to your doorstep.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#d97706' } }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#d97706' } }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#d97706' } }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#d97706' } }}>
                <YouTube />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#25D366' } }}>
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                Home
              </Link>
              <Link component={RouterLink} to="/products" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                Products
              </Link>
              <Link component={RouterLink} to="/about" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                About Us
              </Link>
              <Link component={RouterLink} to="/contact" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Categories */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/products?category=appetizers" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                Appetizers
              </Link>
              <Link component={RouterLink} to="/products?category=main-course" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                Main Course
              </Link>
              <Link component={RouterLink} to="/products?category=breads" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                Breads
              </Link>
              <Link component={RouterLink} to="/products?category=desserts" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: '#d97706' } }}>
                Desserts
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
              Get in Touch
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Phone sx={{ color: '#d97706', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                +91 98765 43210
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Email sx={{ color: '#d97706', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                support@asruka-foods.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOn sx={{ color: '#d97706', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Hyderabad, Telangana, India
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                🍽️ Authentic
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                🌿 Fresh
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                ⭐ Trusted
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} Asruka-Foods. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;