import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <Box sx={{ py: 8, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
            }}
          >
            About Asruka-Foods
          </Typography>

          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Our Story
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Asruka-Foods was born from a simple belief: that great food brings people together.
              We source the finest ingredients and prepare them with traditional recipes passed
              down through generations.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Every dish is crafted with love and attention to detail, ensuring you get the
              authentic taste of India in every bite.
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h2" sx={{ color: '#d97706' }}>🍽️</Typography>
                <Typography variant="h6" fontWeight={600}>Authentic Recipes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Traditional recipes passed down through generations
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h2" sx={{ color: '#d97706' }}>🌿</Typography>
                <Typography variant="h6" fontWeight={600}>Fresh Ingredients</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sourced daily from local farmers and markets
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h2" sx={{ color: '#d97706' }}>❤️</Typography>
                <Typography variant="h6" fontWeight={600}>Made with Love</Typography>
                <Typography variant="body2" color="text.secondary">
                  Every dish is prepared with care and passion
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AboutPage;