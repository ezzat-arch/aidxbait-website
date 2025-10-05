# Single Product API

This API endpoint fetches a specific product by ID with all its details including images, joints, and reviews.

## Endpoint

```
GET /api/products/[id]
```

## Parameters

| Parameter | Type   | Location | Description           |
| --------- | ------ | -------- | --------------------- |
| `id`      | number | URL path | The unique product ID |

## Response Format

### Success Response (200)

```json
{
	"success": true,
	"data": [
		{
			"id": 1,
			"name": "Product Name",
			"name_ar": "اسم المنتج",
			"description": "Product description",
			"description_ar": "وصف المنتج",
			"price": 99.99,
			"discounted_price": 79.99,
			"currency": "EGP",
			"stock": 10,
			"is_best_seller": true,
			"is_featured": false,
			"is_available": true,
			"is_oos": false,
			"is_for_rent": false,
			"rent_term": null,
			"tags": ["tag1", "tag2"],
			"soft_deleted": false,
			"created_at": "2025-01-01T00:00:00.000Z",
			"updated_at": "2025-01-01T00:00:00.000Z",
			"images": [
				{
					"id": 1,
					"product_id": 1,
					"image_url": "/images/product1.jpg",
					"is_main": true,
					"created_at": "2025-01-01T00:00:00.000Z",
					"updated_at": "2025-01-01T00:00:00.000Z"
				}
			],
			"joints": [
				{
					"joint_id": 1,
					"joint_name": "knee",
					"joint_name_ar": "الركبة",
					"created_at": "2025-01-01T00:00:00.000Z",
					"updated_at": "2025-01-01T00:00:00.000Z"
				}
			],
			"reviews": [
				{
					"id": 1,
					"product_id": 1,
					"patient_id": 1,
					"rating": 5,
					"comment": "Great product!",
					"soft_deleted": false,
					"created_at": "2025-01-01T00:00:00.000Z",
					"updated_at": "2025-01-01T00:00:00.000Z"
				}
			],
			"rating": 4.5,
			"reviewCount": 10
		}
	],
	"count": 1
}
```

### Error Responses

#### Product Not Found (404)

```json
{
	"success": false,
	"error": "Product not found"
}
```

#### Invalid Product ID (400)

```json
{
	"success": false,
	"error": "Invalid product ID"
}
```

#### Server Error (500)

```json
{
	"success": false,
	"error": "Failed to fetch product"
}
```

## Examples

### Get product by ID

```bash
curl http://localhost:3000/api/products/1
```

### JavaScript/TypeScript

```typescript
// Fetch a specific product
const fetchProduct = async (productId: number) => {
	try {
		const response = await fetch(`/api/products/${productId}`);
		const result = await response.json();

		if (result.success && result.data) {
			const product = result.data[0];
			console.log("Product:", product);
			return product;
		} else {
			console.error("Error:", result.error);
			return null;
		}
	} catch (error) {
		console.error("Failed to fetch product:", error);
		return null;
	}
};

// Usage
const product = await fetchProduct(1);
```

## Notes

1. **Single Product Response**: The response always returns data as an array with a single product (for consistency with the all-products API). Access the product as `data[0]`.

2. **Product Availability**: Only products with `soft_deleted: false` and `is_available: true` can be fetched. Deleted or unavailable products will return a 404 error.

3. **Reviews**: Only non-soft-deleted reviews are included in the response. The `rating` and `reviewCount` fields are calculated from active reviews only.

4. **Images**: At least one image should exist for the product. If no main image is set (`is_main: true`), the product detail page will use the first image in the array.

5. **Performance**: This endpoint is optimized for single product lookups and is more efficient than fetching all products and filtering client-side.

6. **Related Products**: To show related products, you'll need to make an additional call to `/api/products` and filter based on tags or joints.

## Use Cases

### Product Detail Page

```typescript
// In your product detail page component
useEffect(() => {
	const fetchProduct = async () => {
		const response = await fetch(`/api/products/${productId}`);
		const result = await response.json();

		if (result.success && result.data[0]) {
			setProduct(result.data[0]);
		}
	};

	fetchProduct();
}, [productId]);
```

### Quick Product Preview

```typescript
// Show a quick product preview in a modal
const showProductPreview = async (productId: number) => {
	const response = await fetch(`/api/products/${productId}`);
	const result = await response.json();

	if (result.success && result.data[0]) {
		openModal(result.data[0]);
	}
};
```

## Comparison with All Products API

| Feature           | `/api/products`  | `/api/products/[id]` |
| ----------------- | ---------------- | -------------------- |
| Products Returned | Multiple         | Single               |
| Performance       | Slower           | Faster               |
| Use Case          | Product Listing  | Product Detail       |
| Filtering         | Supported        | Not needed           |
| Related Products  | Included in data | Separate API call    |

## See Also

- [All Products API Documentation](../README.md)
- [Product Types](../../../../lib/store-types.ts)
- [Database Schema](../../../../database/)
