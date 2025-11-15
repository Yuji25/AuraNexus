import { supabase } from './config/supabaseClient.js';

// Simple test
const testConnection = async () => {
  console.log("🔗 Testing Supabase connection...");
  const { data, error } = await supabase.from('test_table').select('*');
  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connection successful!");
    console.log("Sample data:", data);
  }
};

testConnection();
