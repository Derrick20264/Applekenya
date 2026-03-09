# API Documentation

## Overview

This e-commerce store provides RESTful API endpoints for managing products, orders, and categories.

## Base URL

```
Development: http://localhost:3000
Production: https://yourdomain.com
```

## Authentication

Currently, the API is open. For production, implement authentication middleware.

## Endpoints

### Products

#### GET /api/products

Fetch all products with optional filtering.

**Query Parameters:**
- `category` (optional) - Filter by category slug
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter
- `search` (optional) - Search in name, brand, description

**Example Request:**
```bash
GET /api/products?category=phones&minPrice=500&maxPrice=1000
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "name": "iPhone 15 Pro",
      "brand": "Apple",
      "price": 999,
      "stock": 50,
      "category": "phones",
      "description": "Latest iPhone...",
      "image_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to fetch products",
  "message": "Database connection error"
}
```

#### GET /api/products/[id]

Fetch a single product by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "iPhone 15 Pro",
    ...
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

#### PUT /api/products/[id]

Update a product.

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 899,
  "stock": 45
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

#### DELETE /api/products/[id]

Delete a product.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Orders

#### GET /api/orders

Fetch all orders.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "0712345678",
      "shipping_address": "123 Main St, Nairobi",
      "total": 1500,
      "status": "pending",
      "items": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/orders

Create a new order.

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "0712345678",
  "shipping_address": "123 Main St, Nairobi",
  "total": 1500,
  "status": "pending",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "iPhone 15 Pro",
      "quantity": 1,
      "price": 999
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": { ... }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["customer_name", "customer_phone", "shipping_address", "items"]
}
```

#### GET /api/orders/[id]

Fetch a single order by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... }
}
```

#### PATCH /api/orders/[id]

Update order status.

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid Statuses:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { ... }
}
```

### Categories

#### GET /api/categories

Fetch all categories.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "uuid",
      "name": "Phones",
      "slug": "phones",
      "description": "Smartphones and mobile devices",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Brief error description",
  "message": "Detailed error message (optional)"
}
```

## Using the API Client

For frontend usage, import the API client:

```typescript
import { apiClient } from '@/lib/api-client'

// Fetch products
const response = await apiClient.getProducts({ category: 'phones' })

// Create order
const order = await apiClient.createOrder({
  customer_name: 'John Doe',
  ...
})
```

## Rate Limiting

Currently no rate limiting. Implement in production using middleware.

## CORS

CORS is enabled for all origins in development. Configure for production.

## Testing

### Using cURL

```bash
# Get all products
curl http://localhost:3000/api/products

# Get products by category
curl "http://localhost:3000/api/products?category=phones"

# Get single product
curl http://localhost:3000/api/products/[id]

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"John","customer_phone":"0712345678",...}'
```

### Using Postman

Import the endpoints into Postman for easy testing.

## Future Enhancements

- [ ] Authentication & Authorization
- [ ] Rate limiting
- [ ] Pagination for large datasets
- [ ] Caching with Redis
- [ ] API versioning
- [ ] Webhook support
- [ ] GraphQL endpoint
