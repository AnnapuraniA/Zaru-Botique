import dotenv from 'dotenv'
import { sequelize } from '../config/db.js'
import { QueryTypes } from 'sequelize'

dotenv.config()

async function addInstructionColumn() {
  try {
    console.log('Adding instruction column to discounts table...')
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='discounts' AND column_name='instruction'
    `)
    
    if (results.length > 0) {
      console.log('Column "instruction" already exists. Skipping...')
      return
    }
    
    // Add instruction column
    await sequelize.query(`
      ALTER TABLE discounts 
      ADD COLUMN instruction TEXT
    `)
    
    console.log('✅ Successfully added instruction column to discounts table')
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

addInstructionColumn()
