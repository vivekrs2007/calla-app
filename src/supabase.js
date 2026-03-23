import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pqvxzsrpifiuovhtxldp.supabase.co'
const SUPABASE_KEY = 'sb_publishable_1tD07qwCETqVRaT_gVQO_Q_-CNpGH9j'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)