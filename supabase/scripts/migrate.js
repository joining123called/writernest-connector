
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

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Directory containing migration files
const migrationsDir = path.join(__dirname, '..', 'migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  console.log(`Created migrations directory: ${migrationsDir}`);
}

async function createMigrationsTableIfNotExists() {
  console.log('Checking for _migrations table...');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: `
        CREATE TABLE IF NOT EXISTS public._migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `
    });
    
    if (error) {
      console.error('Error creating _migrations table:', error);
      return false;
    }
    
    console.log('_migrations table is ready');
    return true;
  } catch (error) {
    console.error('Error checking/creating _migrations table:', error);
    return false;
  }
}

async function checkIfMigrationApplied(migrationName) {
  try {
    const { data, error } = await supabase
      .from('_migrations')
      .select('id')
      .eq('name', migrationName)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking if migration ${migrationName} applied:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error checking if migration ${migrationName} applied:`, error);
    return false;
  }
}

async function recordMigrationApplied(migrationName) {
  try {
    const { error } = await supabase
      .from('_migrations')
      .insert({ name: migrationName });
    
    if (error) {
      console.error(`Error recording migration ${migrationName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error recording migration ${migrationName}:`, error);
    return false;
  }
}

async function runMigration(filePath, fileName) {
  console.log(`Checking migration: ${fileName}`);
  
  try {
    // Check if migration has already been applied
    const isApplied = await checkIfMigrationApplied(fileName);
    
    if (isApplied) {
      console.log(`Migration ${fileName} has already been applied, skipping...`);
      return true;
    }
    
    console.log(`Running migration: ${fileName}`);
    
    // Read migration file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Run the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error running migration ${fileName}:`, error);
      return false;
    }
    
    // Record that this migration has been applied
    const recorded = await recordMigrationApplied(fileName);
    
    if (!recorded) {
      return false;
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
    // Ensure migrations table exists
    const tableReady = await createMigrationsTableIfNotExists();
    
    if (!tableReady) {
      console.error('Failed to ensure migrations table exists');
      process.exit(1);
    }
    
    // Get all migration files and sort them
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
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
