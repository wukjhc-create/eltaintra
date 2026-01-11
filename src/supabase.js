import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsziiiscbfdduuuhfpfet.supabase.co'
const supabaseKey = 'sb_publishable_HMAw1KPUNNSJutCnx7TyWg_UxmCeWIY'

export const supabase = createClient(supabaseUrl, supabaseKey)
