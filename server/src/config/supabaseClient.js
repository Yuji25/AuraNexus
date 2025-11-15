import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Service sambhal ke use karna, it gives the full access to the DB
export const supabase = createClient(supabaseUrl, supabaseKey);
