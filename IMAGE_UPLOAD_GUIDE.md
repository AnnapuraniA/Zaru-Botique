# Image Upload, Storage, and Display Mechanism

This guide explains the complete image upload, storage, and display system used in this application. This mechanism can be reused for other websites.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Database Schema](#database-schema)
6. [File Structure](#file-structure)
7. [Step-by-Step Flow](#step-by-step-flow)
8. [Configuration](#configuration)
9. [Reusing for Another Website](#reusing-for-another-website)

---

## Overview

The system uses a **hybrid approach**:
- **Files are stored on the filesystem** (in `backend/uploads/products/`)
- **URLs are stored in the database** (as an array of strings in the Product model)
- **Files are served statically** via Express static middleware
- **Full URLs are generated** and returned to the frontend

### Key Technologies
- **Multer**: File upload middleware for handling multipart/form-data
- **Express Static**: Serving uploaded files
- **PostgreSQL/Sequelize**: Database storage for image URLs
- **FormData API**: Frontend file upload

---

## Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ 1. User selects image(s)
       │ 2. FormData created
       │
       ▼
┌─────────────────────────────────┐
│   Backend API                   │
│   POST /api/admin/upload/images │
│   - Multer middleware           │
│   - File validation             │
│   - Save to filesystem          │
└──────┬──────────────────────────┘
       │ 3. Files saved to disk
       │ 4. Generate full URLs
       │
       ▼
┌─────────────────────────────────┐
│   Filesystem                    │
│   backend/uploads/products/     │
│   - IMG_0416-1767811658376.jpg  │
│   - product-1234567890.png      │
└──────┬──────────────────────────┘
       │ 5. Return URLs to frontend
       │
       ▼
┌─────────────────────────────────┐
│   Database (PostgreSQL)          │
│   Product.images = [            │
│     "http://localhost:5001/     │
│      uploads/products/...jpg"   │
│   ]                             │
└──────┬──────────────────────────┘
       │ 6. URLs stored when product created/updated
       │
       ▼
┌─────────────────────────────────┐
│   Static File Serving           │
│   GET /uploads/products/*.jpg   │
│   - Express.static middleware   │
└─────────────────────────────────┘
```

---

## Backend Implementation

### 1. Multer Configuration (`backend/middleware/upload.js`)

```javascript
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/products')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)  // Files saved to backend/uploads/products/
  },
  filename: (req, file, cb) => {
    // Generate unique filename: originalname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-')
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  }
})

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false)
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
})

export default upload
```

**Key Points:**
- Files are stored in `backend/uploads/products/`
- Unique filenames prevent conflicts: `originalname-timestamp-random.ext`
- Only image files are allowed (jpeg, jpg, png, gif, webp)
- Maximum file size: 10MB per file
- Directory is created automatically if it doesn't exist

### 2. Upload Route (`backend/routes/uploadRoutes.js`)

```javascript
import express from 'express'
import upload from '../middleware/upload.js'
import multer from 'multer'
import { adminProtect } from '../middleware/adminAuth.js'

const router = express.Router()

// @route   POST /api/admin/upload/images
// @desc    Upload product images
// @access  Admin
router.post('/images', adminProtect, (req, res, next) => {
  // Multer middleware handles file upload
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err)
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' })
        }
        return res.status(400).json({ message: err.message || 'File upload error' })
      }
      return res.status(400).json({ message: err.message || 'File upload error' })
    }
    next()
  })
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    // Generate full URLs for uploaded files
    const protocol = req.protocol || 'http'
    const host = req.get('host') || 'localhost:5001'
    const baseUrl = `${protocol}://${host}`
    
    const imageUrls = req.files.map(file => {
      // Return full URL path that will be served statically
      return `${baseUrl}/uploads/products/${file.filename}`
    })

    res.json({
      success: true,
      images: imageUrls,
      message: `${req.files.length} image(s) uploaded successfully`
    })
  } catch (error) {
    console.error('Image upload processing error:', error)
    res.status(500).json({ message: 'Failed to upload images', error: error.message })
  }
})

export default router
```

**Key Points:**
- Accepts up to 10 files at once (`upload.array('images', 10)`)
- Requires admin authentication (`adminProtect` middleware)
- Generates full URLs: `http://localhost:5001/uploads/products/filename.jpg`
- Returns array of URLs to frontend

### 3. Static File Serving (`backend/server.js`)

```javascript
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Serve static files (uploaded images)
app.use('/uploads', express.static(join(__dirname, 'uploads')))
```

**Key Points:**
- Files in `backend/uploads/` are served at `/uploads/` URL path
- Example: `backend/uploads/products/image.jpg` → `http://localhost:5001/uploads/products/image.jpg`
- No additional route handlers needed for serving files

### 4. Database Model (`backend/models/Product.js`)

```javascript
const Product = sequelize.define('Product', {
  // ... other fields
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  // ... other fields
})
```

**Key Points:**
- Images stored as array of URL strings
- Example: `["http://localhost:5001/uploads/products/img1.jpg", "http://localhost:5001/uploads/products/img2.jpg"]`
- URLs are stored, not file paths

### 5. Product Creation/Update (`backend/routes/adminRoutes.js`)

```javascript
// @route   POST /api/admin/products
router.post('/products', async (req, res) => {
  try {
    const productData = req.body
    
    // Validate that images array is provided
    if (!productData.images || productData.images.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' })
    }
    
    // Create product with image URLs
    const product = await Product.create(productData)
    
    res.status(201).json(product)
  } catch (error) {
    // ... error handling
  }
})
```

**Key Points:**
- Product is created with `images` array containing full URLs
- URLs come from the upload endpoint response

---

## Frontend Implementation

### 1. Upload API Utility (`src/utils/adminApi.js`)

```javascript
export const adminUploadAPI = {
  uploadImages: async (files) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)  // Field name must match backend: 'images'
    })
    
    const token = getAdminToken()
    if (!token) {
      throw new Error('Admin authentication required')
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to upload images')
    }
    
    const data = await response.json()
    return data  // Returns { success: true, images: [url1, url2, ...] }
  }
}
```

**Key Points:**
- Uses `FormData` to send files
- Field name `'images'` must match backend expectation
- Don't set `Content-Type` header - browser sets it automatically with boundary
- Returns array of image URLs

### 2. Upload Handler in Component (`src/pages/Admin/Products.jsx`)

```javascript
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  // Validate file types
  const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
  if (invalidFiles.length > 0) {
    showError('Please select only image files (JPG, PNG, or WebP)')
    e.target.value = ''
    return
  }

  // Validate file sizes (max 10MB each)
  const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024)
  if (oversizedFiles.length > 0) {
    showError('Some images exceed 10MB limit. Please select smaller files.')
    e.target.value = ''
    return
  }

  try {
    setUploadingImages(true)
    
    // Upload files
    const result = await adminUploadAPI.uploadImages(files)
    
    if (result && result.images && Array.isArray(result.images) && result.images.length > 0) {
      // Add uploaded image URLs to form state
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...result.images]
      }))
      success(`${result.images.length} image(s) uploaded successfully`)
    }
  } catch (err) {
    showError(err.message || 'Failed to upload images')
  } finally {
    setUploadingImages(false)
    e.target.value = ''  // Reset file input
  }
}
```

**Key Points:**
- Client-side validation before upload
- Image URLs added to form state
- Form state is sent to backend when creating/updating product

### 3. Display Images (`src/pages/ProductDetail.jsx`)

```javascript
// Get images from product
const productImages = product.images && product.images.length > 0 
  ? product.images 
  : product.image 
    ? [product.image] 
    : ['https://via.placeholder.com/600x800']

// Display in JSX
<div className="product-images">
  <div className="main-image">
    <img 
      src={productImages[selectedImageIndex]} 
      alt={product.name}
    />
  </div>
  {productImages.length > 1 && (
    <div className="thumbnail-images">
      {productImages.map((img, idx) => (
        <button key={idx} onClick={() => setSelectedImageIndex(idx)}>
          <img src={img} alt={`${product.name} ${idx + 1}`} />
        </button>
      ))}
    </div>
  )}
</div>
```

**Key Points:**
- Images are displayed directly using URLs from database
- URLs point to static files served by Express
- No additional API calls needed to fetch images

---

## Database Schema

### Product Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',  -- Array of image URLs
  -- ... other fields
);
```

**Example Data:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Product Name",
  "images": [
    "http://localhost:5001/uploads/products/IMG_0416-1767811658376-123260627.jpg",
    "http://localhost:5001/uploads/products/IMG_0423-1767813076650-65883219.jpg"
  ]
}
```

---

## File Structure

```
backend/
├── middleware/
│   └── upload.js              # Multer configuration
├── routes/
│   ├── uploadRoutes.js        # Upload endpoint
│   └── adminRoutes.js         # Product CRUD (uses image URLs)
├── models/
│   └── Product.js             # Product model with images array
├── uploads/
│   └── products/              # Actual image files stored here
│       ├── IMG_0416-1767811658376-123260627.jpg
│       └── product-1234567890.png
└── server.js                  # Static file serving setup

src/
├── utils/
│   └── adminApi.js            # Upload API function
└── pages/
    └── Admin/
        └── Products.jsx       # Upload handler component
```

---

## Step-by-Step Flow

### Upload Flow

1. **User selects images** in file input (`<input type="file" multiple />`)
2. **Frontend validates** file type and size
3. **FormData created** with files appended as `'images'`
4. **POST request** to `/api/admin/upload/images` with FormData
5. **Multer middleware** receives files, validates, saves to disk
6. **Backend generates** full URLs: `http://host/uploads/products/filename.jpg`
7. **Backend returns** array of URLs: `{ success: true, images: [url1, url2, ...] }`
8. **Frontend stores** URLs in form state
9. **When product saved**, URLs are sent to backend in product data
10. **Backend stores** URLs in database (Product.images array)

### Display Flow

1. **Product fetched** from database (includes images array)
2. **Frontend receives** product with image URLs
3. **Images displayed** using `<img src={url} />` tags
4. **Browser requests** images from `/uploads/products/filename.jpg`
5. **Express static middleware** serves files from `backend/uploads/products/`
6. **Images rendered** in browser

---

## Configuration

### Environment Variables

```env
# Backend URL (for generating full URLs)
PORT=5001
NODE_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:5001/api
```

### Multer Configuration Options

```javascript
// File size limit
limits: {
  fileSize: 10 * 1024 * 1024  // 10MB (adjust as needed)
}

// Max files per upload
upload.array('images', 10)  // Max 10 files (adjust as needed)

// Allowed file types
const allowedTypes = /jpeg|jpg|png|gif|webp/  // Add/remove types as needed
```

### Storage Location

```javascript
// Change upload directory
const uploadsDir = path.join(__dirname, '../uploads/products')
// To change: modify this path
```

---

## Reusing for Another Website

### Step 1: Install Dependencies

```bash
npm install multer
```

### Step 2: Create Upload Middleware

Copy `backend/middleware/upload.js` and adjust:
- Upload directory path
- File size limits
- Allowed file types
- Filename generation logic

### Step 3: Create Upload Route

Copy `backend/routes/uploadRoutes.js` and adjust:
- Route path (`/api/admin/upload/images`)
- Authentication middleware
- Max file count
- URL generation logic

### Step 4: Setup Static File Serving

In your `server.js`:
```javascript
app.use('/uploads', express.static(join(__dirname, 'uploads')))
```

### Step 5: Update Database Model

Add images field to your model:
```javascript
images: {
  type: DataTypes.ARRAY(DataTypes.STRING),
  allowNull: false,
  defaultValue: []
}
```

### Step 6: Create Frontend Upload Function

Copy upload function from `src/utils/adminApi.js`:
```javascript
uploadImages: async (files) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('images', file)
  })
  
  const response = await fetch(`${API_BASE_URL}/upload/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  return response.json()
}
```

### Step 7: Use in Components

```javascript
const handleUpload = async (e) => {
  const files = Array.from(e.target.files)
  const result = await uploadImages(files)
  setImageUrls(result.images)
}
```

### Step 8: Display Images

```javascript
{imageUrls.map(url => (
  <img key={url} src={url} alt="Uploaded" />
))}
```

---

## Important Notes

### Security Considerations

1. **File Type Validation**: Always validate on both client and server
2. **File Size Limits**: Set reasonable limits to prevent DoS
3. **Authentication**: Protect upload endpoints
4. **Filename Sanitization**: Current implementation sanitizes filenames
5. **Storage Location**: Keep uploads outside public web root in production

### Production Considerations

1. **CDN**: Consider using CDN for image delivery
2. **Cloud Storage**: Use S3/Cloudinary for scalable storage
3. **Image Optimization**: Resize/compress images before storing
4. **Backup**: Backup uploads directory
5. **URLs**: Use environment variables for base URL generation

### Alternative: Cloud Storage

For production, consider storing files in cloud storage (AWS S3, Cloudinary, etc.):

```javascript
// Instead of disk storage, use cloud storage
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'my-bucket',
    key: (req, file, cb) => {
      cb(null, `products/${Date.now()}-${file.originalname}`)
    }
  })
})

// Generate cloud URLs
const imageUrls = req.files.map(file => file.location)  // S3 URL
```

---

## Troubleshooting

### Images not displaying
- Check static file serving is configured
- Verify file paths in database match actual file locations
- Check file permissions on uploads directory

### Upload fails
- Check file size limits
- Verify file type is allowed
- Check authentication token
- Verify uploads directory exists and is writable

### CORS issues
- Ensure CORS is configured in backend
- Check API URL in frontend matches backend URL

---

## Summary

This system provides a complete image upload solution:
- ✅ Files stored on filesystem
- ✅ URLs stored in database
- ✅ Static file serving
- ✅ Full URL generation
- ✅ Frontend upload handling
- ✅ Image display

The mechanism is reusable and can be adapted for any website with minimal changes.
