import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, TextField, Button, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Email, Phone, LocationOn } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending message
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

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
            Contact Us
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Get in Touch
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Have questions? We'd love to hear from you. Reach out to us anytime.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Email sx={{ color: '#d97706' }} />
                  <Typography>support@asruka-foods.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Phone sx={{ color: '#d97706' }} />
                  <Typography>+91 98765 43210</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn sx={{ color: '#d97706' }} />
                  <Typography>Hyderabad, Telangana, India</Typography>
                </Box>

                <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Working Hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monday - Saturday: 9:00 AM - 10:00 PM
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sunday: 10:00 AM - 8:00 PM
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Send a Message
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Your Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Message"
                    name="message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: '#fff',
                      py: 1.5,
                      '&:hover': { bgcolor: '#d97706' },
                    }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ContactPage;