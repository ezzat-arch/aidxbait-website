# Database Setup for User Registration

This directory contains SQL scripts needed for the user registration functionality.

## Setup Instructions

1. **Execute the function creation script**:

   Run the following SQL script in your Supabase SQL editor or via psql:

   ```bash
   psql -d your_database_name -f create_website_user_function.sql
   ```

   Or copy and paste the contents of `create_website_user_function.sql` into your Supabase SQL editor.

2. **Verify the function exists**:

   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'create_website_user_with_patient';
   ```

3. **Set up environment variables**:

   Ensure you have the following environment variables configured:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-side only!
   ```

## Function Details

### `create_website_user_with_patient`

This PostgreSQL function handles the complete user registration process in a single transaction:

**Parameters:**

- `p_supabase_id` (UUID): The Supabase auth user ID
- `p_first_name` (VARCHAR): User's first name
- `p_last_name` (VARCHAR): User's last name
- `p_email` (VARCHAR): User's email address
- `p_phone_number` (VARCHAR): User's phone number

**Returns:**
JSON object with either success or error information.

**What it does:**

1. Creates a record in the `users` table with `is_website_user = TRUE`
2. Creates a corresponding record in the `patients` table
3. Uses default values for optional patient fields
4. Ensures ACID compliance through transaction handling
5. Returns detailed success/error information

**Example Usage:**

```sql
SELECT create_website_user_with_patient(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'John',
    'Doe',
    'john.doe@example.com',
    '+1234567890'
);
```

## Architecture Overview

### Client-Side Flow

1. User fills out registration form
2. Form validation occurs on client-side
3. Data sent to `/api/auth/signup` API route

### Server-Side Flow (API Route)

1. **Input validation**: Validate all required fields
2. **Auth user creation**: Use `supabaseAdmin.auth.admin.createUser()` with service role key
3. **Database records**: Call RPC function with elevated privileges
4. **Error handling**: Clean up auth user if database operations fail
5. **Response**: Return success/error to client

### Database Function

1. **Transaction start**: Implicit transaction in PostgreSQL function
2. **Users table**: Insert with `is_website_user = TRUE`
3. **Patients table**: Insert with default values
4. **Success/Error**: Return structured JSON response
5. **Rollback**: Automatic rollback on any error

## Security

- **Service Role Key**: Used only in server-side API routes to bypass RLS
- **Function Security**: Uses `SECURITY DEFINER` to run with elevated privileges
- **Permissions**: Granted to both `authenticated` and `service_role`
- **Input Validation**: All inputs validated before database operations
- **Error Handling**: Comprehensive error handling with cleanup

## Error Handling

The implementation includes multi-layer error handling:

### API Route Level

- Input validation errors
- Auth creation errors
- Database operation errors
- Cleanup of auth user if database fails

### Database Function Level

- SQL constraint violations
- Data type errors
- Foreign key violations
- Returns structured error information

### Client Level

- Network errors
- API response errors
- User-friendly error messages

## Troubleshooting

### Common Issues

1. **Function not found**: Ensure the SQL function has been created in your database
2. **Permission denied**: Verify service role key is correctly set in environment variables
3. **RLS blocking operations**: Service role key should bypass RLS automatically
4. **User type enum error**: Ensure 'Patient' is a valid value in your `user_types` enum

### Debug Steps

1. Check Supabase logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test the database function directly in SQL editor
4. Check API route logs for server-side errors

## Best Practices

1. **Never expose service role key** to client-side code
2. **Always validate inputs** before database operations
3. **Implement proper cleanup** if operations fail
4. **Use transactions** for multi-step operations
5. **Log errors** for debugging but never log sensitive data
