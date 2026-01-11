import dotenv from 'dotenv'
import { sequelize } from '../config/db.js'
import { QueryTypes } from 'sequelize'

dotenv.config()

async function addCoinsColumn() {
  try {
    console.log('Adding coins column to users table...')
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='coins'
    `)
    
    if (results.length > 0) {
      console.log('Coins column already exists. Skipping...')
      return
    }
    
    // Add coins column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN coins INTEGER DEFAULT 0 NOT NULL CHECK (coins >= 0)
    `)
    
    console.log('✅ Successfully added coins column to users table')
    
    // Create coin_transactions table
    console.log('Creating coin_transactions table...')
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS coin_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'expired', 'refunded')),
        amount INTEGER NOT NULL CHECK (amount > 0),
        "balanceAfter" INTEGER NOT NULL CHECK ("balanceAfter" >= 0),
        description VARCHAR(255) NOT NULL,
        "orderId" VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `)
    
    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id_created_at 
      ON coin_transactions("userId", "createdAt" DESC)
    `)
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_coin_transactions_order_id 
      ON coin_transactions("orderId")
    `)
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_coin_transactions_type 
      ON coin_transactions(type)
    `)
    
    console.log('✅ Successfully created coin_transactions table')
    
    // Initialize default coin rules in settings
    console.log('Initializing default coin rules...')
    
    const defaultEarningRule = {
      threshold: 5000,
      coins: 10
    }
    
    const defaultRedemptionRule = {
      coins: 50,
      discountPercent: 5
    }
    
    // Check if rules already exist
    const [earningRule] = await sequelize.query(`
      SELECT id FROM settings WHERE key = 'coin_earning_rule'
    `)
    
    if (earningRule.length === 0) {
      await sequelize.query(`
        INSERT INTO settings (id, key, value, type, category, description, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          'coin_earning_rule',
          :value,
          'json',
          'general',
          'Coin earning rules: threshold (amount) and coins awarded',
          NOW(),
          NOW()
        )
      `, {
        replacements: { value: JSON.stringify(defaultEarningRule) }
      })
      console.log('✅ Added default coin earning rule')
    }
    
    const [redemptionRule] = await sequelize.query(`
      SELECT id FROM settings WHERE key = 'coin_redemption_rule'
    `)
    
    if (redemptionRule.length === 0) {
      await sequelize.query(`
        INSERT INTO settings (id, key, value, type, category, description, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          'coin_redemption_rule',
          :value,
          'json',
          'general',
          'Coin redemption rules: coins required and discount percentage',
          NOW(),
          NOW()
        )
      `, {
        replacements: { value: JSON.stringify(defaultRedemptionRule) }
      })
      console.log('✅ Added default coin redemption rule')
    }
    
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

addCoinsColumn()
