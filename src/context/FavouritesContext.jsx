import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// ============================================
// CREATE FAVOURITES CONTEXT
// ============================================
const FavouritesContext = createContext();

// ============================================
// FAVOURITES PROVIDER
// ============================================
export const FavouritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // FETCH FAVOURITES
  // ============================================
  const fetchFavourites = async () => {
    if (!user) {
      // Load from localStorage for guest
      const saved = localStorage.getItem('asruka-favourites');
      if (saved) {
        try {
          setFavourites(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading favourites:', e);
          setFavourites([]);
        }
      } else {
        setFavourites([]);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favourites')
        .select(`
          product_id,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Extract product data
      const products = data.map(item => item.products).filter(Boolean);
      setFavourites(products);
    } catch (error) {
      console.error('Error fetching favourites:', error);
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD FAVOURITES ON AUTH CHANGE
  // ============================================
  useEffect(() => {
    fetchFavourites();
  }, [user]);

  // ============================================
  // ADD FAVOURITE
  // ============================================
  const addFavourite = async (product) => {
    // Guest user - save to localStorage
    if (!user) {
      const existing = favourites.find(p => p.id === product.id);
      if (existing) {
        toast.info('Already in favourites');
        return;
      }
      
      const updated = [...favourites, product];
      setFavourites(updated);
      localStorage.setItem('asruka-favourites', JSON.stringify(updated));
      toast.success('Added to favourites ❤️');
      return;
    }

    try {
      // Check if already exists
      const existing = favourites.find(p => p.id === product.id);
      if (existing) {
        toast.info('Already in favourites');
        return;
      }

      const { error } = await supabase
        .from('favourites')
        .insert({ 
          user_id: user.id, 
          product_id: product.id 
        });

      if (error) throw error;
      
      // Update local state
      setFavourites([...favourites, product]);
      toast.success('Added to favourites ❤️');
    } catch (error) {
      console.error('Error adding favourite:', error);
      toast.error('Failed to add to favourites');
    }
  };

  // ============================================
  // REMOVE FAVOURITE
  // ============================================
  const removeFavourite = async (productId) => {
    // Guest user - remove from localStorage
    if (!user) {
      const updated = favourites.filter(p => p.id !== productId);
      setFavourites(updated);
      localStorage.setItem('asruka-favourites', JSON.stringify(updated));
      toast.info('Removed from favourites');
      return;
    }

    try {
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      // Update local state
      setFavourites(favourites.filter(p => p.id !== productId));
      toast.info('Removed from favourites');
    } catch (error) {
      console.error('Error removing favourite:', error);
      toast.error('Failed to remove from favourites');
    }
  };

  // ============================================
  // TOGGLE FAVOURITE
  // ============================================
  const toggleFavourite = (product) => {
    const isFav = isFavourite(product.id);
    if (isFav) {
      removeFavourite(product.id);
    } else {
      addFavourite(product);
    }
  };

  // ============================================
  // CHECK IF FAVOURITE
  // ============================================
  const isFavourite = (productId) => {
    return favourites.some(p => p.id === productId);
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    favourites,
    loading,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    isFavourite,
    count: favourites.length,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};

// ============================================
// USE FAVOURITES HOOK
// ============================================
export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};

export default FavouritesContext;