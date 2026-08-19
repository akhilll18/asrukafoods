import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Home,
  Store,
  Info,
  ContactMail,
  Favorite,
  Person,
  Dashboard,
  Logout,
  Login,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavourites } from '../../context/FavouritesContext';
import { motion } from 'framer-motion';
import CartDrawer from '../cart/CartDrawer';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { count: favouritesCount } = useFavourites();
  const { user, profile, logout, isAuthenticated } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navLinks = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Products', icon: <Store />, path: '/products' },
    { text: 'About', icon: <Info />, path: '/about' },
    { text: 'Contact', icon: <ContactMail />, path: '/contact' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCartOpen = () => setCartOpen(true);
  const handleCartClose = () => setCartOpen(false);
  const handleProfileMenu = (event) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await logout();
    handleProfileClose();
    navigate('/');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 280 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          my: 2, 
          fontFamily: "'Poppins', sans-serif", 
          fontWeight: 700,
          color: '#d97706' 
        }}
      >
        🍽️ Asruka-Foods
      </Typography>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem
            key={link.text}
            component="button"
            onClick={() => navigate(link.path)}
            sx={{ 
              '&:hover': { bgcolor: '#f5f5f5' }, 
              borderRadius: 2, 
              mx: 1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText 
              primary={link.text} 
              primaryTypographyProps={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
              }}
            />
          </ListItem>
        ))}
        <Divider />
        <ListItem component="button" onClick={() => navigate('/favourites')}>
          <ListItemIcon><Favorite /></ListItemIcon>
          <ListItemText 
            primary="Favourites" 
            primaryTypographyProps={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
            }}
          />
          <Chip label={favouritesCount} size="small" color="secondary" />
        </ListItem>
        {isAuthenticated ? (
          <>
            <ListItem component="button" onClick={() => navigate('/profile')}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText 
                primary="My Profile" 
                primaryTypographyProps={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                }}
              />
            </ListItem>
            <ListItem component="button" onClick={() => navigate('/orders')}>
              <ListItemIcon><Dashboard /></ListItemIcon>
              <ListItemText 
                primary="My Orders" 
                primaryTypographyProps={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                }}
              />
            </ListItem>
            {user?.email?.includes('admin') && (
              <ListItem component="button" onClick={() => navigate('/admin')}>
                <ListItemIcon><Dashboard /></ListItemIcon>
                <ListItemText 
                  primary="Admin Panel" 
                  primaryTypographyProps={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            )}
            <ListItem component="button" onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                }}
              />
            </ListItem>
          </>
        ) : (
          <ListItem component="button" onClick={() => navigate('/profile')}>
            <ListItemIcon><Login /></ListItemIcon>
            <ListItemText 
              primary="Login / Sign Up" 
              primaryTypographyProps={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed" // CHANGED: sticky → fixed for better sticky behavior
        sx={{
          bgcolor: '#d97706',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          color: '#ffffff',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100, // Keeps navbar above everything
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar sx={{ py: 1, justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  color: '#ffffff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  '&:hover': {
                    color: '#1a1a1a',
                  },
                }}
              >
                🍽️ Asruka-Foods
              </Typography>
            </motion.div>

            {/* Desktop Navigation */}
            {!isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.text}
                    component={Link}
                    to={link.path}
                    sx={{
                      color: '#ffffff',
                      fontWeight: 500,
                      fontFamily: "'Poppins', sans-serif",
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': { 
                        color: '#1a1a1a',
                        bgcolor: 'rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    {link.text}
                  </Button>
                ))}

                {/* Favourites */}
                <IconButton 
                  component={Link} 
                  to="/favourites" 
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': { 
                      color: '#1a1a1a',
                    },
                  }}
                >
                  <Badge badgeContent={favouritesCount} color="secondary">
                    <Favorite />
                  </Badge>
                </IconButton>

                {/* Cart - Always accessible */}
                <IconButton 
                  onClick={handleCartOpen} 
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': { 
                      color: '#1a1a1a',
                    },
                  }}
                >
                  <Badge badgeContent={totalItems} color="primary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                {/* Profile */}
                {isAuthenticated ? (
                  <>
                    <IconButton onClick={handleProfileMenu} sx={{ p: 0, ml: 1 }}>
                      <Avatar 
                        src={profile?.avatar_url} 
                        sx={{ 
                          width: 35, 
                          height: 35, 
                          bgcolor: '#1a1a1a',
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 600,
                          color: '#ffffff',
                          border: '2px solid rgba(255,255,255,0.3)',
                        }}
                      >
                        {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleProfileClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      sx={{
                        '& .MuiMenuItem-root': {
                          fontFamily: "'Poppins', sans-serif",
                        },
                      }}
                    >
                      <MenuItem onClick={() => { navigate('/profile'); handleProfileClose(); }}>
                        <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                        Profile
                      </MenuItem>
                      <MenuItem onClick={() => { navigate('/orders'); handleProfileClose(); }}>
                        <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                        My Orders
                      </MenuItem>
                      {user?.email?.includes('admin') && (
                        <MenuItem onClick={() => { navigate('/admin'); handleProfileClose(); }}>
                          <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                          Admin Panel
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/profile')}
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: '#ffffff',
                      borderRadius: '50px',
                      textTransform: 'none',
                      px: 3,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      '&:hover': { 
                        bgcolor: '#ffffff',
                        color: '#1a1a1a',
                      },
                    }}
                  >
                    Login
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  component={Link} 
                  to="/favourites" 
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': { 
                      color: '#1a1a1a',
                    },
                  }}
                >
                  <Badge badgeContent={favouritesCount} color="secondary">
                    <Favorite />
                  </Badge>
                </IconButton>
                <IconButton 
                  onClick={handleCartOpen} 
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': { 
                      color: '#1a1a1a',
                    },
                  }}
                >
                  <Badge badgeContent={totalItems} color="primary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
                <IconButton 
                  onClick={handleDrawerToggle} 
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': { 
                      color: '#1a1a1a',
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={handleCartClose} />

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <Box sx={{ height: { xs: 56, sm: 64 } }} />
    </>
  );
};

export default Navbar;