// Ensure user_profiles and user_stats tables exist
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oruswxugpdjukyrcxpbo.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXN3eHVncGRqdWt5cmN4cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEyMTU2OSwiZXhwIjoyMDc4Njk3NTY5fQ.pfiIAQ-oB8cf3JUOrNjC7DxD9hkUg7ra2WOsZV1ePaE'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function ensureTables() {
  console.log('\n🔧 Ensuring user tables exist...\n')

  try {
    // Test if user_profiles table exists by trying to query it
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.log('❌ user_profiles table does not exist or is not accessible')
      console.log('Error:', error.message)
      console.log('\n📋 Please run the SQL schema manually:')
      console.log('1. Go to: https://oruswxugpdjukyrcxpbo.supabase.co/project/oruswxugpdjukyrcxpbo/sql/new')
      console.log('2. Copy and run the contents of supabase-schema.sql')
      console.log('3. This will create all necessary tables with RLS policies\n')
      process.exit(1)
    } else {
      console.log('✓ user_profiles table exists')
    }

    // Test user_stats table
    const { error: statsError } = await supabase
      .from('user_stats')
      .select('id')
      .limit(1)

    if (statsError) {
      console.log('❌ user_stats table does not exist or is not accessible')
      console.log('Error:', statsError.message)
      process.exit(1)
    } else {
      console.log('✓ user_stats table exists')
    }

    console.log('\n✅ All user tables are ready!\n')
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

ensureTables()
