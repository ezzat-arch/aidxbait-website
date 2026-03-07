# Categories API

This API endpoint fetches store categories with their subcategories.

## Endpoints

### Get All Categories

```
GET /api/categories
```

### Get Single Category

```
GET /api/categories/[id]
```

## Response Format

### Success Response

```json
{
	"success": true,
	"data": [
		{
			"id": 1,
			"name": "Category Name",
			"name_ar": "اسم الفئة",
			"created_at": "2025-01-01T00:00:00.000Z",
			"updated_at": "2025-01-01T00:00:00.000Z",
			"subcategories": [
				{
					"id": 1,
					"category_id": 1,
					"name": "Subcategory Name",
					"name_ar": "اسم الفئة الفرعية",
					"created_at": "2025-01-01T00:00:00.000Z",
					"updated_at": "2025-01-01T00:00:00.000Z"
				}
			]
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

### Get all categories with subcategories

```bash
curl http://localhost:3000/api/categories
```

### Get a specific category by ID

```bash
curl http://localhost:3000/api/categories/1
```

## Notes

1. **Subcategories**: Each category includes all its associated subcategories in the `subcategories` array.

2. **Ordering**: Categories are ordered by `created_at` in ascending order.

3. **Empty Results**: If no categories exist, the API returns an empty array with `count: 0`.

## Database Requirements

Before using this API, ensure the following tables exist:

- `store_categories`
- `store_subcategories`

