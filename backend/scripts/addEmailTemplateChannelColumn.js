import { sequelize } from '../config/db.js'

async function addChannelColumn() {
  try {
    console.log('Adding channel column to email_templates table...')
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'email_templates' 
      AND column_name = 'channel'
    `)
    
    if (results.length > 0) {
      console.log('Channel column already exists. Skipping...')
      return
    }
    
    // Create enum type if it doesn't exist
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_email_templates_channel AS ENUM ('email', 'sms');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    
    // Add channel column with default value
    await sequelize.query(`
      ALTER TABLE email_templates 
      ADD COLUMN channel enum_email_templates_channel DEFAULT 'email' NOT NULL;
    `)
    
    // Update existing records to have 'email' as channel
    await sequelize.query(`
      UPDATE email_templates 
      SET channel = 'email' 
      WHERE channel IS NULL;
    `)
    
    console.log('Channel column added successfully!')
  } catch (error) {
    console.error('Error adding channel column:', error)
    throw error
  }
}

// Run migration
addChannelColumn()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
