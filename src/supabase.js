import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pqvxzsrpifiuovhtxldp.supabase.co'
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxdnh6c3JwaWZpdW92aHR4bGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjAwNzksImV4cCI6MjA4OTc5NjA3OX0.A9qk3lNxhj-dRyJ1pEVjqVfuhRhFlJgUXKlDCMxIF4U'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})