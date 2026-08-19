import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
  Grid,
  Alert,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  Visibility,
  Refresh,
  Edit,
  CheckCircle,
  Cancel,
  LocalShipping,
  Pending,
  Receipt,
  Person,
  Phone,
  LocationOn,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminGetAllOrders, adminUpdateOrderStatus } from '../../services/adminService';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updating, setUpdating] = useState(false);
  const itemsPerPage = 10;

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile');
      return;
    }
    if (user && !user.email?.includes('admin') && !user.email?.includes('asruka')) {
      navigate('/');
      toast.error('Unauthorized access');
      return;
    }
  }, [user, isAuthenticated, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await adminGetAllOrders(
        filter === 'all' ? null : filter,
        itemsPerPage,
        (page - 1) * itemsPerPage
      );
      if (result.success) {
        setOrders(result.orders);
        setTotalOrders(result.total);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email?.includes('admin') || user?.email?.includes('asruka')) {
      fetchOrders();
    }
  }, [filter, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const result = await adminUpdateOrderStatus(
        orderId,
        newStatus,
        `Order status updated to ${newStatus}`,
        'Admin'
      );
      if (result.success) {
        toast.success('Order status updated successfully');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      paid: '#22c55e',
      failed: '#ef4444',
      refunded: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusOptions = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  // Filter orders by search
  const filteredOrders = orders.filter(order =>
    order.order_id?.toLowerCase().includes(search.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    order.customer?.phone?.includes(search)
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress sx={{ color: '#d97706' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                📦 Order Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all orders, update status, and track deliveries
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchOrders}
              sx={{
                bgcolor: '#1a1a1a',
                borderRadius: '50px',
                '&:hover': { bgcolor: '#333' },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Orders"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Order ID, Customer, Phone"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Filter by Status"
                  >
                    <MenuItem value="all">All Orders</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total: {totalOrders} orders
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Orders Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No orders found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {order.order_id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(order.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{order.customer?.name || 'N/A'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.customer?.phone || 'No phone'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <Typography key={idx} variant="caption" display="block" color="text.secondary">
                              {item.name} × {item.quantity}
                            </Typography>
                          ))}
                          {order.items?.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{order.items.length - 2} more
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ₹{order.total?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.payment_status?.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getPaymentStatusColor(order.payment_status),
                              color: '#fff',
                            }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {order.payment_method === 'cod' ? 'COD' : 'Online'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                              disabled={updating}
                              sx={{
                                '& .MuiSelect-select': { py: 0.5, fontSize: '0.75rem' },
                              }}
                            >
                              {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {getStatusLabel(status)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order)}
                            sx={{ color: '#d97706' }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(totalOrders / itemsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: '#d97706',
                    color: '#fff',
                  },
                }}
              />
            </Box>
          </Paper>

          {/* Order Details Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  Order Details - {selectedOrder?.order_id}
                </Typography>
                <Button
                  variant="text"
                  onClick={() => setOpenDialog(false)}
                  sx={{ color: '#999' }}
                >
                  Close
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {selectedOrder && (
                <Box>
                  <Grid container spacing={2}>
                    {/* Customer Info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        <Person sx={{ fontSize: 16, mr: 0.5 }} /> Customer Details
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedOrder.customer?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <Phone sx={{ fontSize: 14, mr: 0.5 }} /> {selectedOrder.customer?.phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOrder.customer?.email}
                        </Typography>
                        {selectedOrder.customer?.address && (
                          <>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2">
                              <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                              {selectedOrder.customer.address.street}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedOrder.customer.address.city}, {selectedOrder.customer.address.state}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pincode: {selectedOrder.customer.address.pincode}
                            </Typography>
                          </>
                        )}
                      </Paper>
                    </Grid>

                    {/* Order Info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        <Receipt sx={{ fontSize: 16, mr: 0.5 }} /> Order Information
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Chip
                            label={getStatusLabel(selectedOrder.status)}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(selectedOrder.status),
                              color: '#fff',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">Payment</Typography>
                          <Chip
                            label={selectedOrder.payment_status?.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getPaymentStatusColor(selectedOrder.payment_status),
                              color: '#fff',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">Method</Typography>
                          <Typography variant="body2">
                            {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">Date</Typography>
                          <Typography variant="body2">
                            {formatDate(selectedOrder.created_at)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Items */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Items
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        {selectedOrder.items?.map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                            <Typography variant="body2">
                              {item.name} {item.weight && `(${item.weight})`} × {item.quantity}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                          <Typography variant="body2">₹{selectedOrder.subtotal?.toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Delivery</Typography>
                          <Typography variant="body2">
                            {selectedOrder.delivery_charge === 0 ? 'Free' : `₹${selectedOrder.delivery_charge}`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="h6" fontWeight={700}>Total</Typography>
                          <Typography variant="h6" fontWeight={700} color="#d97706">
                            ₹{selectedOrder.total?.toLocaleString()}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Tracking Updates */}
                    {selectedOrder.tracking?.updates && selectedOrder.tracking.updates.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          <LocalShipping sx={{ fontSize: 16, mr: 0.5 }} /> Tracking Updates
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                          {selectedOrder.tracking.updates.slice().reverse().map((update, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 2, py: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                                {formatDate(update.timestamp)}
                              </Typography>
                              <Typography variant="body2">
                                {update.note || update.status}
                                {update.location && ` (${update.location})`}
                              </Typography>
                            </Box>
                          ))}
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AdminOrders;