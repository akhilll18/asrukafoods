import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// ============================================
// CART REDUCER
// ============================================
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, variant, quantity } = action.payload;
      const cartKey = variant ? `${product.id}-${variant.weight}` : product.id;
      
      const existingItem = state.items.find(item => item.cartKey === cartKey);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.cartKey === cartKey
              ? { ...item, quantity: item.quantity + (quantity || 1) }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, {
          cartKey,
          productId: product.id,
          name: product.name,
          image: product.image_url || product.image,
          variant: variant || null,
          quantity: quantity || 1,
          price: variant ? variant.price : product.price,
          weight: variant?.weight || '',
        }],
      };
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.cartKey !== action.payload),
      };
      
    case 'UPDATE_QUANTITY': {
      const { cartKey, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.cartKey !== cartKey),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity }
            : item
        ),
      };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
      
    case 'LOAD_CART':
      return { ...state, items: action.payload || [] };
      
    default:
      return state;
  }
};

// ============================================
// CREATE CART CONTEXT
// ============================================
const CartContext = createContext();

// ============================================
// CART PROVIDER
// ============================================
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD CART
  // ============================================
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      
      // Try to load from Supabase if user is logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .single();
          
          if (!error && data?.items) {
            dispatch({ type: 'LOAD_CART', payload: data.items });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading cart from Supabase:', error);
        }
      }
      
      // Fallback to localStorage
      const savedCart = localStorage.getItem('asruka-cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsed });
        } catch (e) {
          console.error('Error loading cart from localStorage:', e);
        }
      }
      
      setLoading(false);
    };
    
    loadCart();
  }, [user]);

  // ============================================
  // SYNC CART
  // ============================================
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('asruka-cart', JSON.stringify(state.items));
    
    // Sync to Supabase if user is logged in
    if (user && !loading) {
      const syncCart = async () => {
        try {
          const { error } = await supabase
            .from('carts')
            .upsert({
              user_id: user.id,
              items: state.items,
              updated_at: new Date().toISOString(),
            });
          
          if (error) console.error('Error syncing cart:', error);
        } catch (error) {
          console.error('Error syncing cart:', error);
        }
      };
      
      syncCart();
    }
  }, [state.items, user, loading]);

  // ============================================
  // CART ACTIONS
  // ============================================
  const addToCart = (product, variant, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, variant, quantity } });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (cartKey) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartKey });
    toast.info('Item removed from cart');
  };

  const updateQuantity = (cartKey, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartKey, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.info('Cart cleared');
  };

  // ============================================
  // CART CALCULATIONS
  // ============================================
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = totalPrice;
  const deliveryCharge = totalPrice > 500 ? 0 : 40;
  const grandTotal = subtotal + deliveryCharge;

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    items: state.items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    subtotal,
    deliveryCharge,
    grandTotal,
    isEmpty: state.items.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// ============================================
// USE CART HOOK
// ============================================
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;