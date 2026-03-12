# Product Image Upload Guide

## Overview

The admin product form now supports two methods for adding product images:
1. Upload from device (stored in Supabase Storage)
2. Paste external image URL

## Features

### 1. Upload from Device
- Click "Choose File" or drag and drop
- Supported formats: JPG, PNG, WebP, GIF
- Maximum file size: 5MB (configurable)
- Images are uploaded to Supabase Storage bucket: `product-images`
- Automatic public URL generation

### 2. Paste Image URL
- Enter any direct image URL
- Useful for images already hosted elsewhere
- No upload required - URL is saved directly

### 3. Image Preview
- Real-time preview before saving
- Shows which method is being used (upload vs URL)
- Error handling for invalid images
- Remove/clear image option

### 4. Fallback Handling
- Placeholder shown if no image provided
- Graceful error handling if image fails to load
- SVG placeholder icon for better UX

## Setup Instructions

### 1. Create Supabase Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to Storage
3. Click "Create a new bucket"
4. Name it: `product-images`
5. Set to **Public** (important!)
6. Click "Create bucket"

### 2. Configure Storage Policies

Run this SQL in your Supabase SQL Editor:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated uploads (or public if needed)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' );

-- Allow authenticated updates
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' );

-- Allow authenticated deletes
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' );
```

### 3. Configure CORS (if needed)

If uploading from a different domain, configure CORS in Supabase:

```json
{
  "allowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAge": 3600
}
```

## Usage

### Admin Panel

1. Go to `/admin/products`
2. Click "Add New Product" or edit existing product
3. Scroll to "Product Image" section

**Option A: Upload from Device**
- Click "Choose File"
- Select an image from your computer
- Preview appears automatically
- Image will be uploaded when you save the product

**Option B: Paste Image URL**
- Paste a direct image URL in the text field
- Preview appears automatically
- URL will be saved when you save the product

4. Fill in other product details
5. Click "Create Product" or "Update Product"

### Image Display

Images are automatically displayed on:
- Shop page (product grid)
- Product detail page
- Cart page
- Admin product list
- Order confirmation

## File Structure

```
components/
  admin/
    ProductForm.tsx          # Enhanced with image upload
  ProductCard.tsx            # Displays product images
  ProductGallery.tsx         # Product detail page gallery

lib/
  supabase-functions.ts      # uploadProductImage() function
  types.ts                   # Product type with image_url

app/
  admin/
    products/
      page.tsx               # Admin products page
```

## Image Upload Function

Located in `lib/supabase-functions.ts`:

```typescript
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}
```

## Best Practices

### Image Optimization

1. **Resize before upload**
   - Recommended: 800x800px for product images
   - Use tools like TinyPNG or ImageOptim

2. **File formats**
   - JPG for photos
   - PNG for graphics with transparency
   - WebP for best compression (modern browsers)

3. **File size**
   - Keep under 500KB for fast loading
   - Compress images before upload

### Image URLs

When using external URLs:
- Use HTTPS URLs only
- Ensure images are publicly accessible
- Use CDN URLs when possible
- Avoid hotlinking from other stores

### Naming Convention

Uploaded files are automatically named:
```
products/[random-string].[extension]
```

Example: `products/k3j2h4g5.jpg`

## Troubleshooting

### Image Not Uploading

1. Check Supabase Storage bucket exists
2. Verify bucket is set to Public
3. Check storage policies are configured
4. Ensure file size is under limit
5. Check browser console for errors

### Image Not Displaying

1. Verify image URL is correct
2. Check image is publicly accessible
3. Ensure CORS is configured
4. Check browser console for 404 errors
5. Try opening image URL directly in browser

### Upload Fails

Common issues:
- File too large (>5MB)
- Invalid file format
- Storage quota exceeded
- Network timeout
- Missing permissions

### Image Preview Not Showing

1. Check file is valid image format
2. Verify URL is direct image link (not webpage)
3. Check browser console for errors
4. Try different image

## Security Considerations

1. **File validation**
   - Only accept image MIME types
   - Validate file extensions
   - Check file size limits

2. **Storage policies**
   - Restrict uploads to authenticated users
   - Implement rate limiting
   - Monitor storage usage

3. **URL validation**
   - Validate URL format
   - Check for malicious URLs
   - Sanitize user input

## Performance Tips

1. **Lazy loading**
   - Images load as user scrolls
   - Reduces initial page load

2. **Image optimization**
   - Use Next.js Image component (optional)
   - Implement responsive images
   - Use appropriate formats

3. **Caching**
   - Set proper cache headers
   - Use CDN for static assets
   - Implement browser caching

## Future Enhancements

- [ ] Multiple images per product
- [ ] Image cropping/editing
- [ ] Drag and drop upload
- [ ] Bulk image upload
- [ ] Image compression on upload
- [ ] Image gallery/carousel
- [ ] Zoom functionality
- [ ] Alt text management
- [ ] Image SEO optimization

## Support

For issues with:
- Supabase Storage: Check [Supabase Docs](https://supabase.com/docs/guides/storage)
- Image upload: Review browser console errors
- Display issues: Check network tab in DevTools
