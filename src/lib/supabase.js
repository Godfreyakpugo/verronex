import { createClient } from '@supabase/supabase-js'

// These lines pull the secret keys we put in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// This "supabase" variable is now the remote control for your database
export const supabase = createClient(supabaseUrl, supabaseKey)

