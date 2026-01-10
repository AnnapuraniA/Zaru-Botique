import dotenv from 'dotenv'
import { sequelize } from '../config/db.js'

dotenv.config()

const addUserPreferencesColumn = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL Connected successfully')
    
    // Check if preferences column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'preferences'
    `)
    
    if (results.length > 0) {
      console.log('✅ Preferences column already exists in users table')
      process.exit(0)
    }
    
    // Add preferences column as JSONB with default value
    console.log('Step 1: Adding preferences column to users table...')
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"emailNotifications": true, "smsNotifications": false, "newsletter": false}'::jsonb
    `)
    console.log('✅ Preferences column added successfully')
    
    // Update existing records to have default preferences if they don't have one
    console.log('Step 2: Updating existing records with default preferences...')
    await sequelize.query(`
      UPDATE users 
      SET preferences = '{"emailNotifications": true, "smsNotifications": false, "newsletter": false}'::jsonb
      WHERE preferences IS NULL
    `)
    console.log('✅ Existing records updated')
    
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

addUserPreferencesColumn()
