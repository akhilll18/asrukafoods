import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  Logout,
  ShoppingBag,
  Favorite,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { getUserOrders } from '../services/orderService';

const ProfilePage = () => {
  const { user, profile, updateProfile, logout, isAuthenticated, signIn, signUp, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  
  // Auth forms
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        pincode: profile.address?.pincode || '',
        landmark: profile.address?.landmark || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const result = await getUserOrders();
    if (result.success) {
      setOrders(result.orders || []);
    }
    setOrdersLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark,
      },
    });
    setLoading(false);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleAuthSubmit = async () => {
    setAuthLoading(true);
    let result;
    
    if (isLogin) {
      result = await signIn(authData.email, authData.password);
    } else {
      result = await signUp(authData.email, authData.password, authData.name, authData.phone);
    }
    
    setAuthLoading(false);
    
    if (result.success) {
      setAuthData({ email: '', password: '', name: '', phone: '' });
    }
  };

  const handleGuestLogin = async () => {
    setAuthLoading(true);
    const result = await guestLogin('Guest', '');
    setAuthLoading(false);
    if (result.success) {
      setAuthData({ email: '', password: '', name: '', phone: '' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
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

  // If not authenticated, show login/signup
  if (!isAuthenticated) {
    return (
      <Box sx={{ py: 8, bgcolor: '#fafafa', minHeight: '100vh' }}>
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper sx={{ p: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </Typography>

              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAuthSubmit(); }}>
                {!isLogin && (
                  <>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={authData.name}
                      onChange={handleAuthChange}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={authData.phone}
                      onChange={handleAuthChange}
                      margin="normal"
                    />
                  </>
                )}
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={authData.email}
                  onChange={handleAuthChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={authData.password}
                  onChange={handleAuthChange}
                  margin="normal"
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={authLoading}
                  sx={{
                    mt: 3,
                    bgcolor: '#d97706',
                    color: '#fff',
                    py: 1.5,
                    '&:hover': { bgcolor: '#b86505' },
                  }}
                >
                  {authLoading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                </Button>
              </Box>

              <Button
                fullWidth
                variant="text"
                onClick={handleGuestLogin}
                disabled={authLoading}
                sx={{ mt: 1, color: '#666' }}
              >
                Continue as Guest
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <Button
                    variant="text"
                    onClick={() => setIsLogin(!isLogin)}
                    sx={{ color: '#d97706' }}
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Button>
                </Typography>
              </Box>
            </Paper>
          </motion.div>
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
              mb: 4,
            }}
          >
            My Profile
          </Typography>

          <Grid container spacing={4}>
            {/* Profile Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: '#d97706',
                    fontSize: 40,
                  }}
                >
                  {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {profile?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                {profile?.is_guest && (
                  <Chip label="Guest" size="small" color="warning" sx={{ mt: 1 }} />
                )}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="text"
                    startIcon={<Person />}
                    sx={{ justifyContent: 'flex-start', color: '#1a1a1a' }}
                  >
                    My Profile
                  </Button>
                  <Button
                    component={Link}
                    to="/orders"
                    startIcon={<ShoppingBag />}
                    sx={{ justifyContent: 'flex-start', color: '#1a1a1a' }}
                  >
                    My Orders
                  </Button>
                  <Button
                    component={Link}
                    to="/favourites"
                    startIcon={<Favorite />}
                    sx={{ justifyContent: 'flex-start', color: '#1a1a1a' }}
                  >
                    Favourites
                  </Button>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  sx={{ color: '#ef4444', borderColor: '#ef4444' }}
                >
                  Logout
                </Button>
              </Paper>
            </Grid>

            {/* Profile Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Profile Edit Section */}
              <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Personal Information
                  </Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      sx={{ color: '#d97706' }}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Box>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => {
                          setIsEditing(false);
                          if (profile) {
                            setFormData({
                              name: profile.name || '',
                              phone: profile.phone || '',
                              address: profile.address?.street || '',
                              city: profile.address?.city || '',
                              state: profile.address?.state || '',
                              pincode: profile.address?.pincode || '',
                              landmark: profile.address?.landmark || '',
                            });
                          }
                        }}
                        sx={{ mr: 1 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        sx={{ bgcolor: '#d97706' }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={user?.email}
                      disabled
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: '#999' }} />,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Landmark (Optional)"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Recent Orders */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Orders
                  </Typography>
                  <Button
                    component={Link}
                    to="/orders"
                    sx={{ color: '#d97706' }}
                  >
                    View All
                  </Button>
                </Box>

                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#d97706' }} />
                  </Box>
                ) : orders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No orders yet</Typography>
                    <Button
                      component={Link}
                      to="/products"
                      variant="contained"
                      sx={{ mt: 2, bgcolor: '#d97706' }}
                    >
                      Start Shopping
                    </Button>
                  </Box>
                ) : (
                  orders.slice(0, 3).map((order) => (
                    <Card key={order.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {order.order_id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </Typography>
                          </Box>
                          <Chip
                            label={getStatusLabel(order.status)}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(order.status),
                              color: '#fff',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {order.items?.length || 0} items
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            ₹{order.total?.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ProfilePage;