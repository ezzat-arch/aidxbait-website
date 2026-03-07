# Category API (Single)

This API endpoint fetches a single category by ID with all its subcategories.

## Endpoint

```
GET /api/categories/[id]
```

## Path Parameters

| Parameter | Type   | Description           |
| --------- | ------ | --------------------- |
| `id`      | number | The category ID       |

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

#### Invalid Category ID

```json
{
	"success": false,
	"error": "Invalid category ID"
}
```

#### Category Not Found

```json
{
	"success": false,
	"error": "Category not found"
}
```

## Examples

### Get category with ID 1

```bash
curl http://localhost:3000/api/categories/1
```

## Notes

1. **Subcategories**: The category includes all its associated subcategories in the `subcategories` array.

2. **Validation**: The category ID must be a valid integer. Non-numeric IDs will return a 400 error.

3. **Not Found**: If the category doesn't exist, the API returns a 404 error.

## Database Requirements

Before using this API, ensure the following tables exist:

- `store_categories`
- `store_subcategories`

