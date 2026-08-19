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
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Close,
  Save,
  Category,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';

const AdminCategories = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image_url: '',
    is_active: true,
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email?.includes('admin') || user?.email?.includes('asruka')) {
      fetchCategories();
    }
  }, [user]);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setIsEditing(true);
      setSelectedCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        icon: category.icon || '',
        image_url: category.image_url || '',
        is_active: category.is_active !== undefined ? category.is_active : true,
      });
    } else {
      setIsEditing(false);
      setSelectedCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image_url: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name: name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const categoryData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
      };

      if (isEditing && selectedCategory) {
        // Update category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', selectedCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        // Create category
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
        toast.success('Category created successfully');
      }

      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
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
      <Container maxWidth="lg">
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
                📂 Category Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your food categories and organize your menu
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchCategories}
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
                Add Category
              </Button>
            </Box>
          </Box>

          {/* Categories Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No categories found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                              {category.icon || '📁'}
                            </Typography>
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {category.name}
                              </Typography>
                              {category.image_url && (
                                <Avatar
                                  src={category.image_url}
                                  sx={{ width: 30, height: 30, mt: 0.5 }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={category.slug} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {category.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={category.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: category.is_active ? '#22c55e' : '#ef4444',
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(category)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(category)}
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
          </Paper>

          {/* Add/Edit Category Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  {isEditing ? 'Edit Category' : 'Add New Category'}
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
                    label="Category Name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    helperText="URL-friendly name (auto-generated)"
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
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Icon (Emoji)"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="🍕"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        name="is_active"
                        color="success"
                      />
                    }
                    label="Active"
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

export default AdminCategories;