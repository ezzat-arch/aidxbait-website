# Products API

This API endpoint fetches all products with their complete details including images, joints, and reviews.

## Endpoint

```
GET /api/products
```

## Query Parameters

All query parameters are optional:

| Parameter        | Type    | Description                                                           |
| ---------------- | ------- | --------------------------------------------------------------------- |
| `joint`          | string  | Filter by joint name (e.g., "knee", "shoulder", "back")               |
| `currency`       | string  | Filter by currency (EGP, USD, EUR, GBP, AED, SAR, KWD, BHD, OMR, QAR) |
| `is_best_seller` | boolean | Filter for best sellers only (true/false)                             |
| `is_featured`    | boolean | Filter for featured products only (true/false)                        |
| `is_for_rent`    | boolean | Filter for rental products only (true/false)                          |
| `in_stock`       | boolean | Filter for in-stock products only (true/false)                        |

## Response Format

### Success Response

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

### Error Response

```json
{
	"success": false,
	"error": "Error message"
}
```

## Examples

### Get all products

```bash
curl http://localhost:3000/api/products
```

### Get products for knee joint

```bash
curl http://localhost:3000/api/products?joint=knee
```

### Get best sellers in EGP currency

```bash
curl http://localhost:3000/api/products?is_best_seller=true&currency=EGP
```

### Get in-stock featured products

```bash
curl http://localhost:3000/api/products?is_featured=true&in_stock=true
```

## Notes

1. **Product Tags**: Tags are stored in the database but are hidden from the user interface. They are used for:

   - Determining related products
   - Search functionality
   - Internal categorization

2. **Ratings**: The `rating` field is calculated as the average of all non-soft-deleted reviews. The `reviewCount` field shows the total number of active reviews.

3. **Main Image**: Each product should have one main image (where `is_main` is `true`). If no main image is specified, the first image in the array is used by default.

4. **Soft Deletion**: Products with `soft_deleted: true` are automatically excluded from the results.

5. **Availability**: Products are only returned if:

   - `is_available` is `true`
   - `soft_deleted` is `false`

6. **In-Stock Filter**: When `in_stock=true` is used, only products with `stock > 0` and `is_oos: false` are returned.

## Database Requirements

Before using this API, ensure the following tables exist:

- `products`
- `product_images`
- `product_joints`
- `product_joint_names` (see `/database/product_joint_names.sql`)
- `product_reviews`
- `patients`
