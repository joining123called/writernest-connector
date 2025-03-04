
# Supabase Integration

This directory contains configuration files and database migrations for our Supabase backend.

## Environment Configuration

The application uses environment variables for configuration. Copy the `.env.example` file to `.env` in the root directory and update the values:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials.

## Database Migrations

Database migrations are managed in the `migrations` directory. Each migration file:

- Is prefixed with a sequential number (e.g., `00001_`, `00002_`) to ensure order
- Contains idempotent SQL that can be run multiple times without errors
- Is tracked in a `_migrations` table to prevent duplicate application

### Running Migrations

To run migrations locally, use the migration script:

```bash
# Install dependencies (if not already installed)
npm install dotenv @supabase/supabase-js

# Run migrations
node supabase/scripts/migrate.js
```

### Creating New Migrations

To create a new migration:

1. Create a new SQL file in the `migrations` directory with the next sequential number
2. Add idempotent SQL that checks if the migration has already been applied
3. Make sure to update the `_migrations` table with your migration name

Example template:

```sql
-- Migration: 00003_your_migration_name
-- Description: Your description here
-- Created: YYYY-MM-DD

-- Check if migration has already been applied
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public._migrations WHERE name = '00003_your_migration_name') THEN
    RAISE NOTICE 'Migration 00003_your_migration_name has already been applied, skipping...';
  ELSE
    -- Apply your changes here

    -- Record that this migration has been applied
    INSERT INTO public._migrations (name) VALUES ('00003_your_migration_name');
    
    RAISE NOTICE 'Migration 00003_your_migration_name has been applied successfully.';
  END IF;
END $$;
```

### Rolling Back Migrations

For critical rollbacks, create a new migration that undoes the changes from a previous migration.

## Security Considerations

- Never commit `.env` files containing real credentials to version control
- The `SUPABASE_SERVICE_KEY` has elevated permissions and should be protected
- All database operations should use Row Level Security (RLS) policies appropriately

## Testing

Before deploying migrations to production:

1. Test all migrations in a development environment
2. Verify that rollback procedures work as expected
3. Check that all RLS policies are correctly applied

## CI/CD Integration

Migrations can be automatically applied during CI/CD deployment by configuring the `auto_apply = true` setting in `config.toml`.
