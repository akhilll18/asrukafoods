// src/scripts/seedProducts.js
import { supabase } from '../lib/supabase';
import { products } from '../data/products';

const seedProducts = async () => {
  console.log('🌱 Seeding products...');
  
  for (const product of products) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

      if (error) {
        console.error(`❌ Failed to insert ${product.name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${product.name}`);
      }
    } catch (error) {
      console.error(`❌ Error:`, error);
    }
  }
  
  console.log('✨ Seeding complete!');
};

seedProducts();