import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsziiscbfdduuuhfpfet.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemlpc2NiZmRkdXV1aGZwZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTQ2MDcsImV4cCI6MjA4MzY5MDYwN30.OmVvoCMh17Yh0FaGo4vhd_7ihEtDtD422Rad2XaqyE0'

export const supabase = createClient(supabaseUrl, supabaseKey)
