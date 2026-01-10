import dotenv from 'dotenv'
import { sequelize } from '../config/db.js'

dotenv.config()

const addCouponUserUsageLimitColumn = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL Connected successfully')
    
    // Check if userUsageLimit column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'coupons' 
      AND column_name = 'userUsageLimit'
    `)
    
    if (results.length > 0) {
      console.log('✅ userUsageLimit column already exists in coupons table')
      process.exit(0)
    }
    
    // Create enum type if it doesn't exist
    console.log('Step 1: Creating userUsageLimit enum type if it doesn\'t exist...')
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_coupons_userUsageLimit" AS ENUM('once', 'multiple');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('✅ Enum type ready')
    
    // Add userUsageLimit column with default value
    console.log('Step 2: Adding userUsageLimit column to coupons table...')
    await sequelize.query(`
      ALTER TABLE coupons 
      ADD COLUMN IF NOT EXISTS "userUsageLimit" "enum_coupons_userUsageLimit" DEFAULT 'multiple' NOT NULL
    `)
    console.log('✅ userUsageLimit column added successfully')
    
    // Update existing records to have 'multiple' as default
    console.log('Step 3: Updating existing records...')
    await sequelize.query(`
      UPDATE coupons 
      SET "userUsageLimit" = 'multiple' 
      WHERE "userUsageLimit" IS NULL
    `)
    console.log('✅ Existing records updated')
    
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

addCouponUserUsageLimitColumn()
