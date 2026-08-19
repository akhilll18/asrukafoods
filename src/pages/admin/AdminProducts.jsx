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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Alert,
  Snackbar,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Image,
  Close,
  Save,
  Inventory,
  Category,
  CurrencyRupee,
  Description,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    discount_price: '',
    image_url: '',
    in_stock: true,
    is_featured: false,
    is_best_seller: false,
    rating: 4.5,
    reviews: 0,
    preparation_time: '',
    ingredients: [],
    dietary_tags: [],
    variants: [],
  });

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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: productsData, error: productsError, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email?.includes('admin') || user?.email?.includes('asruka')) {
      fetchData();
    }
  }, [page]);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setIsEditing(true);
      setSelectedProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || '',
        discount_price: product.discount_price || '',
        image_url: product.image_url || '',
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
        is_featured: product.is_featured || false,
        is_best_seller: product.is_best_seller || false,
        rating: product.rating || 4.5,
        reviews: product.reviews || 0,
        preparation_time: product.preparation_time || '',
        ingredients: product.ingredients || [],
        dietary_tags: product.dietary_tags || [],
        variants: product.variants || [],
      });
    } else {
      setIsEditing(false);
      setSelectedProduct(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        discount_price: '',
        image_url: '',
        in_stock: true,
        is_featured: false,
        is_best_seller: false,
        rating: 4.5,
        reviews: 0,
        preparation_time: '',
        ingredients: [],
        dietary_tags: [],
        variants: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleArrayInput = (field, value) => {
    setFormData({
      ...formData,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean),
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        rating: parseFloat(formData.rating) || 4.5,
        reviews: parseInt(formData.reviews) || 0,
      };

      if (isEditing && selectedProduct) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const getCategoryName = (categoryName) => {
    const cat = categories.find(c => c.name === categoryName || c.slug === categoryName);
    return cat ? cat.name : categoryName;
  };

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
                🍽️ Product Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your menu items, add new products, and update inventory
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchData}
                sx={{
                  bgcolor: '#1a1a1a',
                  borderRadius: '50px',
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: '#d97706',
                  borderRadius: '50px',
                  '&:hover': { bgcolor: '#b86505' },
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

          {/* Products Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Featured</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No products found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={product.image_url}
                              variant="rounded"
                              sx={{ width: 50, height: 50 }}
                            >
                              <Image />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {product.description?.substring(0, 50)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getCategoryName(product.category)}
                            size="small"
                            sx={{ bgcolor: '#f0f0f0' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ₹{product.price?.toLocaleString()}
                          </Typography>
                          {product.discount_price && (
                            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through', display: 'block' }}>
                              ₹{product.discount_price?.toLocaleString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.in_stock ? 'In Stock' : 'Out of Stock'}
                            size="small"
                            sx={{
                              bgcolor: product.in_stock ? '#22c55e' : '#ef4444',
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {product.is_featured && (
                            <Chip label="⭐ Featured" size="small" sx={{ bgcolor: '#d97706', color: '#fff' }} />
                          )}
                          {product.is_best_seller && (
                            <Chip label="🏆 Best Seller" size="small" sx={{ bgcolor: '#8b5cf6', color: '#fff', ml: 0.5 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ⭐ {product.rating || 4.5} ({product.reviews || 0})
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(product)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(product)}
                            sx={{ color: '#ef4444' }}
                          >
                            <Delete fontSize="small" />
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
                count={Math.ceil(totalProducts / itemsPerPage)}
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

          {/* Add/Edit Product Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </Typography>
                <IconButton onClick={handleCloseDialog}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category"
                      required
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                          {cat.icon} {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Preparation Time"
                    name="preparation_time"
                    value={formData.preparation_time}
                    onChange={handleInputChange}
                    placeholder="e.g., 20-25 mins"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    InputProps={{ startAdornment: <CurrencyRupee sx={{ mr: 0.5, color: '#999' }} /> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Discount Price (₹)"
                    name="discount_price"
                    type="number"
                    value={formData.discount_price}
                    onChange={handleInputChange}
                    InputProps={{ startAdornment: <CurrencyRupee sx={{ mr: 0.5, color: '#999' }} /> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Ingredients (comma separated)"
                    name="ingredients"
                    value={formData.ingredients.join(', ')}
                    onChange={(e) => handleArrayInput('ingredients', e.target.value)}
                    placeholder="Paneer, Butter, Tomato, Cream"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Dietary Tags (comma separated)"
                    name="dietary_tags"
                    value={formData.dietary_tags.join(', ')}
                    onChange={(e) => handleArrayInput('dietary_tags', e.target.value)}
                    placeholder="vegetarian, gluten-free, vegan"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.in_stock}
                        onChange={handleInputChange}
                        name="in_stock"
                        color="success"
                      />
                    }
                    label="In Stock"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        name="is_featured"
                        color="warning"
                      />
                    }
                    label="Featured"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_best_seller}
                        onChange={handleInputChange}
                        name="is_best_seller"
                        color="secondary"
                      />
                    }
                    label="Best Seller"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Rating"
                    name="rating"
                    type="number"
                    value={formData.rating}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
                sx={{
                  bgcolor: '#d97706',
                  '&:hover': { bgcolor: '#b86505' },
                }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AdminProducts;