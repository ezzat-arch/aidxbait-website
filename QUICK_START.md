# Quick Start Guide - Product Store

## What Was Done

✅ **Redefined all store types** to match your database schema  
✅ **Created API route** `/api/products` to fetch products with all details  
✅ **Updated store page** to fetch from API instead of dummy data  
✅ **Updated all components** to work with new Product structure  
✅ **Created database migration** for `product_joint_names` table

## Quick Setup

### 1. Create the Joint Names Table

Run this SQL in your Supabase SQL Editor:

```sql
-- See: database/product_joint_names.sql
-- Creates the product_joint_names table with common joints
```

### 2. Verify Your Database Schema

Ensure these tables exist:

- ✅ `products`
- ✅ `product_images`
- ✅ `product_joints`
- ✅ `product_joint_names` (created in step 1)
- ✅ `product_reviews`
- ✅ `patients` (for reviews)

### 3. Test the API

```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by joint
curl http://localhost:3000/api/products?joint=knee

# Get best sellers
curl http://localhost:3000/api/products?is_best_seller=true
```

### 4. Access the Store

Navigate to: `http://localhost:3000/services/store`

## Key Changes You Need to Know

### Product Structure

```typescript
// OLD (dummy data)
product.id          // string
product.image       // single image
product.joint       // single joint
product.originalPrice // old price
product.inStock     // boolean
product.stockCount  // number

// NEW (database)
product.id          // number
product.images[]    // array of images
product.joints[]    // array of joints
product.discounted_price // sale price
product.is_available && !product.is_oos && product.stock > 0
product.stock       // number
```

### Price Logic Changed!

```typescript
// Display price (what customer pays)
const displayPrice = product.discounted_price || product.price;

// Original price (shown with strikethrough if discount exists)
const originalPrice = product.price;
```

### Product Tags

- Stored in database but **hidden from UI**
- Used for search and related products
- Tags help find products even if not in name/description

## File Changes

### Modified Files:

1. `lib/store-types.ts` - Complete type rewrite
2. `app/services/store/page.tsx` - API integration
3. `components/store/ProductCard.tsx` - New product display
4. `components/store/CartItem.tsx` - Cart display updates
5. `contexts/cart-context.tsx` - Type updates
6. `components/store/HorizontalFilters.tsx` - Price range update

### New Files:

1. `app/api/products/route.ts` - Product API endpoint
2. `app/api/products/README.md` - API documentation
3. `database/product_joint_names.sql` - Joint names table
4. `STORE_IMPLEMENTATION_SUMMARY.md` - Full documentation
5. `QUICK_START.md` - This file

## Common Issues & Solutions

### Issue: API returns empty array

**Solution:** Check that you have:

- Products in database with `soft_deleted = false`
- Products with `is_available = true`
- At least one image per product in `product_images`
- Joint associations in `product_joints`

### Issue: Images not displaying

**Solution:** Ensure:

- Image URLs are absolute or properly configured in Next.js
- At least one image has `is_main = true`
- Images are accessible from your app

### Issue: Joints not showing

**Solution:** Check:

- `product_joint_names` table has data
- `product_joints` table links products to joints
- Joint names match exactly (case-sensitive)

### Issue: Type errors in cart

**Solution:**

- Product IDs are now `number`, not `string`
- Update any code comparing/storing product IDs

## Next Steps

1. **Add products to database** if not already present
2. **Test all filters** (joints, price, stock)
3. **Test cart functionality** (add, remove, update)
4. **Check mobile responsiveness**
5. **Add product images** to Supabase Storage
6. **Consider adding product detail page** for individual products

## Need Help?

- **API Docs:** See `app/api/products/README.md`
- **Full Details:** See `STORE_IMPLEMENTATION_SUMMARY.md`
- **Database Schema:** Check files in `database/` folder
- **Type Definitions:** Review `lib/store-types.ts`
