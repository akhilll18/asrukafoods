// src/data/products.js
// This file is only for backup/reference
// Products are stored in Supabase database

export const productCategories = [
  { id: 'pickles', name: 'Pickles', icon: '🥒', count: 10 },
  { id: 'snacks', name: 'Snacks', icon: '🍿', count: 8 },
  { id: 'powders', name: 'Powders', icon: '🧂', count: 7 },
  { id: 'bowls', name: 'Bowls', icon: '🥗', count: 8 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', count: 4 },
];

// This will be fetched from Supabase
export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getProductsByCategory = async (category) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .limit(8);
  
  if (error) throw error;
  return data;
};

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};