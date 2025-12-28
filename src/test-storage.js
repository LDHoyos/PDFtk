// Test only storage service
console.log('Loading storage service...')
const { createClient } = require('@supabase/supabase-js')
console.log('Supabase client loaded')

const url = process.env.SUPABASE_URL || 'test'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test'

console.log('Creating Supabase client...')
const supabase = createClient(url, key)
console.log('✅ Storage service OK')
