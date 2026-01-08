import dotenv from 'dotenv'
import { sequelize } from '../config/db.js'

dotenv.config()

const addUserStatusColumn = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL Connected successfully')
    
    // Check if status column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'status'
    `)
    
    if (results.length > 0) {
      console.log('✅ Status column already exists in users table')
      process.exit(0)
    }
    
    // Check if the enum type exists, if not create it
    console.log('Step 1: Creating status enum type if it doesn\'t exist...')
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_users_status" AS ENUM('active', 'inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('✅ Enum type ready')
    
    // Add status column with default value
    console.log('Step 2: Adding status column to users table...')
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status "enum_users_status" DEFAULT 'active' NOT NULL
    `)
    console.log('✅ Status column added successfully')
    
    // Update existing records to have 'active' status if they don't have one
    console.log('Step 3: Updating existing records...')
    await sequelize.query(`
      UPDATE users 
      SET status = 'active' 
      WHERE status IS NULL
    `)
    console.log('✅ Existing records updated')
    
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

addUserStatusColumn()
