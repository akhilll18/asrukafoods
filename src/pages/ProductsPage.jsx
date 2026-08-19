import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const itemsPerPage = 12; // Changed to 12 (4 rows x 3 columns)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true);

        if (categoriesError) throw categoriesError;

        setProducts(productsData || []);
        setCategories(categoriesData || []);
        
        // If category is in URL, set it
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setCategory(categoryParam);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (category !== 'all') {
      const categoryObj = categories.find(c => c.slug === category);
      if (categoryObj) {
        result = result.filter(p => p.category === categoryObj.name);
      } else {
        result = result.filter(p => p.category === category);
      }
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // 'featured' - keep original order
        break;
    }

    setFilteredProducts(result);
    setPage(1);
  }, [searchTerm, category, sortBy, products, categories]);

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ py: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.8rem', md: '2.5rem' },
            }}
          >
            Our Menu
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontFamily: "'Poppins', sans-serif" }}>
            Discover our range of authentic and delicious dishes
          </Typography>

          {/* Filters */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 4,
              bgcolor: '#ffffff',
              p: 2,
              borderRadius: 2,
              boxShadow: '0 1px 10px rgba(0,0,0,0.05)',
            }}
          >
            <TextField
              size="small"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: '#999' }} /> }}
              sx={{ flex: 1 }}
              inputProps={{
                style: { fontFamily: "'Poppins', sans-serif" }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: "'Poppins', sans-serif" }}>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <MenuItem value="all" sx={{ fontFamily: "'Poppins', sans-serif" }}>All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.slug} sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    {cat.icon} {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: "'Poppins', sans-serif" }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <MenuItem value="featured" sx={{ fontFamily: "'Poppins', sans-serif" }}>Featured</MenuItem>
                <MenuItem value="price-low" sx={{ fontFamily: "'Poppins', sans-serif" }}>Price: Low to High</MenuItem>
                <MenuItem value="price-high" sx={{ fontFamily: "'Poppins', sans-serif" }}>Price: High to Low</MenuItem>
                <MenuItem value="rating" sx={{ fontFamily: "'Poppins', sans-serif" }}>Highest Rated</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Results count */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: "'Poppins', sans-serif" }}>
            Showing {filteredProducts.length} products
          </Typography>

          {/* Products Grid - 4 columns on large screens */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#d97706' }} />
            </Box>
          ) : paginatedProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif" }}>No products found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Try adjusting your search or filter
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1}>
              {paginatedProducts.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(filteredProducts.length / itemsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontFamily: "'Poppins', sans-serif",
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: '#d97706',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#b86505',
                    },
                  },
                }}
              />
            </Box>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default ProductsPage;