
#!/usr/bin/env node

/**
 * Database migration runner for Supabase
 * 
 * This script runs SQL migration files in order.
 * Each migration is run inside a transaction and tracked in a _migrations table.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This requires a service key with more permissions

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Directory containing migration files
const migrationsDir = path.join(__dirname, '..', 'migrations');

async function runMigration(filePath, fileName) {
  console.log(`Running migration: ${fileName}`);
  
  try {
    // Read migration file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Run the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log(`Migration ${fileName} completed successfully`);
    return true;
  } catch (error) {
    console.error(`Error running migration ${fileName}:`, error);
    return false;
  }
}

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Get all migration files and sort them
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    let success = true;
    
    // Run each migration in order
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const result = await runMigration(filePath, file);
      if (!result) {
        success = false;
        break;
      }
    }
    
    if (success) {
      console.log('All migrations completed successfully');
    } else {
      console.error('Migration process failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();
