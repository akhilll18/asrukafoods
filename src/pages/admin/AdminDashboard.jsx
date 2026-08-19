import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  People,
  AttachMoney,
  TrendingUp,
  Inventory,
  Receipt,
  Refresh,
  ArrowForward,
  Pending,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { adminGetStats, adminGetAllOrders } from '../../services/adminService';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile');
      toast.error('Please login to access admin panel');
      return;
    }
    
    // Check if user is admin (email contains 'admin' or check admin role)
    if (user && !user.email?.includes('admin') && !user.email?.includes('asruka')) {
      navigate('/');
      toast.error('Unauthorized access');
      return;
    }
  }, [user, isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResult = await adminGetStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }

      // Fetch recent orders
      const ordersResult = await adminGetAllOrders(null, 10);
      if (ordersResult.success) {
        setRecentOrders(ordersResult.orders);
      }

      // Fetch recent customers (last 5)
      const { data: customers, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error) {
        setRecentCustomers(customers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email?.includes('admin') || user?.email?.includes('asruka')) {
      fetchDashboardData();
    }
  }, [user]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress sx={{ color: '#d97706' }} />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
      link: '/admin/orders',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#22c55e',
      link: '/admin/customers',
    },
    {
      title: 'Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#d97706',
      link: '/admin/revenue',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: <Pending sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      link: '/admin/orders?status=pending',
    },
    {
      title: 'Delivered',
      value: stats?.completedOrders || 0,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#22c55e',
      link: '/admin/orders?status=delivered',
    },
    {
      title: 'Cancelled',
      value: stats?.cancelledOrders || 0,
      icon: <Cancel sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      link: '/admin/orders?status=cancelled',
    },
  ];

  return (
    <Box sx={{ py: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                👑 Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user?.email?.split('@')[0] || 'Admin'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchDashboardData}
              sx={{
                bgcolor: '#1a1a1a',
                borderRadius: '50px',
                '&:hover': { bgcolor: '#333' },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    component={Link}
                    to={stat.link}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {stat.title}
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4}>
            {/* Recent Orders */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Orders
                  </Typography>
                  <Button
                    component={Link}
                    to="/admin/orders"
                    endIcon={<ArrowForward />}
                    sx={{ color: '#d97706' }}
                  >
                    View All
                  </Button>
                </Box>

                {recentOrders.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No orders yet
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {order.order_id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {order.customer?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              ₹{order.total?.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(order.status)}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(order.status),
                                  color: '#fff',
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                component={Link}
                                to={`/admin/orders?order=${order.order_id}`}
                                size="small"
                              >
                                <Receipt fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* Quick Stats & Recent Customers */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Quick Stats */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Stats
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats?.completionRate || 0}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Avg. Order Value</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{(stats?.averageOrderValue || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Today's Orders</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats?.todayOrders || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">COD Orders</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats?.codOrders || 0}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Recent Customers */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Customers
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {recentCustomers.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No customers yet
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recentCustomers.map((customer) => (
                      <Box key={customer.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          {customer.name?.[0]?.toUpperCase() || 'U'}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {customer.name || 'User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.phone || 'No phone'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AdminDashboard;