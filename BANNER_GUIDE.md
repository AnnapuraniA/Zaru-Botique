# Banner Management Guide

## ✅ How Banners Work

The banner system is **already fully connected**! Banners added from the admin panel automatically appear in the hero section of the homepage.

### Flow:
1. **Admin adds banner** → `/admin/banners` page
2. **Banner saved** → Stored in database
3. **Homepage fetches** → Automatically loads visible banners
4. **Hero section displays** → Banners appear with auto-rotation

---

## 📍 Where to Add Banners

### Admin Panel Location:
**Path:** `/admin/banners`

**Navigation:**
1. Login to admin panel
2. Go to **Marketing** section in sidebar
3. Click **"Banners & Sliders"**

---

## 🎯 How to Add a Banner

### Step 1: Access Banner Management
- Navigate to `/admin/banners` in the admin panel

### Step 2: Click "Add Banner" Button
- Click the **"Add New Banner"** button in the top right

### Step 3: Fill in Banner Details

**Required Fields:**
- **Banner Title** * - Main heading text (e.g., "Summer Collection Sale")
- **Banner Image** * - Image URL or upload image file

**Optional Fields:**
- **Subtitle** - Secondary text (e.g., "Up to 50% off")
- **Link URL** - Where banner should link (e.g., `/products/women`)
- **Start Date** - When banner should start showing
- **End Date** - When banner should stop showing
- **Visible** - Toggle to show/hide banner

### Step 4: Add Image

**Option A: Upload Image (Recommended)**
1. Click **"Upload Image"** button
2. Select an image file (JPG, PNG, etc.)
3. Image will be uploaded and URL auto-filled

**Option B: Use Image URL**
1. Paste image URL directly in the text field
2. Can use external URLs or uploaded image URLs

### Step 5: Save Banner
- Click **"Add Banner"** button
- Banner is immediately saved and will appear on homepage

---

## 🎨 Banner Features

### Auto-Display
- Banners automatically appear in hero section if:
  - `visible` is set to `true`
  - Current date is between `startDate` and `endDate` (if set)
  - Banner has valid image URL

### Auto-Rotation
- Multiple banners automatically rotate every 5 seconds
- Users can manually navigate with arrow buttons
- Dot indicators show current banner

### Positioning
- Use **Up/Down arrows** to change banner order
- Position determines display order (lower number = shown first)

### Visibility Control
- Toggle **Eye icon** to show/hide banner without deleting
- Hidden banners won't appear on homepage

---

## 📝 Banner Form Fields Explained

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Title** | ✅ Yes | Main banner heading | "Summer Sale 2024" |
| **Subtitle** | ❌ No | Secondary text below title | "Up to 50% off" |
| **Image** | ✅ Yes | Banner background image | URL or uploaded file |
| **Link URL** | ❌ No | Where banner clicks go | `/products/women` |
| **Start Date** | ❌ No | When to start showing | 2024-01-01 |
| **End Date** | ❌ No | When to stop showing | 2024-12-31 |
| **Visible** | ❌ No | Show/hide toggle | Checkbox |

---

## 🔧 Banner Management Actions

### Edit Banner
1. Click **Edit icon** (pencil) on banner card
2. Modify fields in modal
3. Click **"Update Banner"**

### Delete Banner
1. Click **Delete icon** (trash) on banner card
2. Confirm deletion
3. Banner is permanently removed

### Change Position
1. Click **Up arrow** to move banner earlier
2. Click **Down arrow** to move banner later
3. Position updates automatically

### Toggle Visibility
1. Click **Eye icon** to show/hide
2. Hidden banners don't appear on homepage
3. Can be re-enabled anytime

---

## 🖼️ Image Requirements

### Recommended Specifications:
- **Format:** JPG, PNG, WebP
- **Size:** Max 5MB per image
- **Dimensions:** 
  - Desktop: 1920x600px (or similar wide ratio)
  - Mobile: 800x600px (or similar)
- **Aspect Ratio:** 16:9 or 3:1 recommended

### Image Upload:
- Images are uploaded to `/uploads` folder
- URLs are automatically generated
- Can be used in banner image field

---

## 🎯 Best Practices

1. **Image Quality**
   - Use high-quality images
   - Optimize file size for faster loading
   - Ensure text is readable on images

2. **Banner Content**
   - Keep titles short and impactful
   - Use clear call-to-action in subtitle
   - Link to relevant product pages

3. **Scheduling**
   - Use start/end dates for time-sensitive promotions
   - Set up banners in advance for sales/events

4. **Positioning**
   - Most important banners should be position 1
   - Limit to 3-5 banners for best UX

5. **Visibility**
   - Hide old banners instead of deleting (for records)
   - Test banners before making visible

---

## 🔍 Where Banners Appear

### Homepage Hero Section
- **Location:** Top of homepage (`/`)
- **Display:** Full-width banner slider
- **Behavior:** Auto-rotates every 5 seconds
- **Controls:** Previous/Next arrows, dot indicators

### Fallback
- If no banners exist, shows default hero content
- Default hero has static text and category buttons

---

## ✅ Current Status

**Everything is already set up and working!**

- ✅ Admin banner management page exists
- ✅ Banner CRUD operations functional
- ✅ Image upload added
- ✅ Homepage fetches banners automatically
- ✅ Hero section displays banners
- ✅ Auto-rotation working
- ✅ Navigation controls working

**You can start adding banners right away!**

---

## 🚀 Quick Start

1. Go to `/admin/banners`
2. Click **"Add New Banner"**
3. Enter title: "Welcome to Arudhra Fashions"
4. Upload or paste image URL
5. Set link: `/products/women` (optional)
6. Click **"Add Banner"**
7. Visit homepage to see banner!

---

**Last Updated:** 2026-01-07
