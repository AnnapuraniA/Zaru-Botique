import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || process.env.DATABASE_NAME || 'arudhra_boutique',
  process.env.POSTGRES_USER || process.env.DATABASE_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || process.env.DATABASE_PASSWORD || '',
  {
    host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || process.env.DATABASE_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL Connected successfully')
    
    // Sync models - only create if they don't exist (safer for production-like setups)
    // Use { alter: true } only when you need to modify schema
    // Use { force: true } to drop and recreate (DANGEROUS - loses data)
    if (process.env.NODE_ENV === 'development') {
      // Check if we should sync - only sync if SYNC_DB env var is set
      if (process.env.SYNC_DB === 'true') {
        try {
          await sequelize.sync({ alter: true })
          console.log('Database models synchronized')
        } catch (syncError) {
          console.warn('Database sync with alter failed:', syncError.message)
          console.log('Continuing without sync - tables should already exist')
        }
      } else {
        // Just verify connection, don't alter schema
        console.log('Database connection verified (sync disabled - set SYNC_DB=true to enable)')
      }
    }
    
    return sequelize
  } catch (error) {
    console.error('PostgreSQL Connection Error:', error.message)
    throw error
  }
}

export { sequelize }
export default connectDB
