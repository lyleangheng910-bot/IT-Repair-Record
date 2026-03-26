import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bcbrxewxdvibbfsuzsef.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYnJ4ZXd4ZHZpYmJmc3V6c2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODA2MzQsImV4cCI6MjA5MDA1NjYzNH0.Bx9Q7y7bh44KwwW-al0jotJeRW8u1KBWNM0CJRVkK9w'

export const supabase = createClient(supabaseUrl, supabaseKey)