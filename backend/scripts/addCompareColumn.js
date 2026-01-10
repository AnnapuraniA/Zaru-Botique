import dotenv from 'dotenv'
import { sequelize } from '../config/db.js'

dotenv.config()

async function addCompareColumn() {
  try {
    console.log('Adding compare column to users table...')
    
    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='compare'
    `)
    
    if (results.length > 0) {
      console.log('Column "compare" already exists. Skipping migration.')
      process.exit(0)
    }
    
    // Add compare column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN compare UUID[] DEFAULT '{}'::uuid[]
    `)
    
    console.log('✅ Successfully added compare column to users table')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error adding compare column:', error)
    process.exit(1)
  }
}

addCompareColumn()
