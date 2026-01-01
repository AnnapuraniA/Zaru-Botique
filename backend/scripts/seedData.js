import dotenv from 'dotenv'
import Product from '../models/Product.js'
import User from '../models/User.js'
import connectDB from '../config/db.js'

dotenv.config()

const products = [
  // Women - Dresses
  {
    name: 'Elegant Summer Dress',
    category: 'Women',
    subcategory: 'Dresses',
    price: 89.99,
    originalPrice: 129.99,
    onSale: true,
    description: 'A beautiful summer dress perfect for any occasion.',
    fullDescription: 'This elegant summer dress is crafted from premium 100% cotton fabric, ensuring breathability and comfort throughout the day.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=600&h=800&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Burgundy', value: '#800020' },
      { name: 'Gold', value: '#D4AF37' }
    ],
    inStock: true,
    stockCount: 15,
    rating: 4.5,
    reviews: 24,
    brand: 'Arudhra Fashions',
    material: '100% Premium Cotton',
    care: 'Machine Wash Cold, Tumble Dry Low'
  },
  {
    name: 'Floral Print Maxi Dress',
    category: 'Women',
    subcategory: 'Dresses',
    price: 79.99,
    description: 'Beautiful floral print maxi dress for summer.',
    images: ['https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=600&h=800&fit=crop'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Pink', value: '#FFB6C1' }],
    inStock: true,
    stockCount: 10,
    rating: 4.6,
    reviews: 15
  },
  // Women - Tops
  {
    name: 'Classic White Shirt',
    category: 'Women',
    subcategory: 'Tops',
    price: 49.99,
    description: 'Timeless classic white shirt.',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', value: '#FFFFFF' }],
    inStock: true,
    stockCount: 20,
    rating: 4.8,
    reviews: 18
  },
  // Teen - Dresses
  {
    name: 'Trendy Teen Dress',
    category: 'Teen',
    subcategory: 'Dresses',
    price: 59.99,
    description: 'Trendy dress perfect for teens.',
    images: ['https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=600&h=800&fit=crop'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Blue', value: '#4169E1' }],
    inStock: true,
    stockCount: 12,
    rating: 4.5,
    reviews: 20
  },
  // Girls - Dresses
  {
    name: 'Princess Dress',
    category: 'Girls',
    subcategory: 'Dresses',
    price: 49.99,
    originalPrice: 69.99,
    onSale: true,
    description: 'Beautiful princess dress for little girls.',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop'],
    sizes: ['XS', 'S', 'M'],
    colors: [{ name: 'Pink', value: '#FFB6C1' }],
    inStock: true,
    stockCount: 8,
    rating: 4.8,
    reviews: 22
  }
]

const seedData = async () => {
  try {
    await connectDB()
    
    // Clear existing products (delete all records)
    const deletedCount = await Product.destroy({ where: {} })
    if (deletedCount > 0) {
      console.log(`Cleared ${deletedCount} existing products`)
    }
    
    // Insert products
    const createdProducts = await Product.bulkCreate(products)
    console.log(`✅ Inserted ${createdProducts.length} products`)
    
    // Create test users
    const testUser1 = await User.findOne({ where: { mobile: '9876543210' } })
    if (!testUser1) {
      await User.create({
        mobile: '9876543210',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com'
      })
      console.log('✅ Created test user: 9876543210 / password123')
    } else {
      console.log('ℹ️  Test user already exists: 9876543210')
    }

    const testUser2 = await User.findOne({ where: { mobile: '1234567890' } })
    if (!testUser2) {
      await User.create({
        mobile: '1234567890',
        password: 'user1234',
        name: 'Demo User',
        email: 'demo@example.com'
      })
      console.log('✅ Created demo user: 1234567890 / user1234')
    } else {
      console.log('ℹ️  Demo user already exists: 1234567890')
    }
    
    console.log('Data seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
