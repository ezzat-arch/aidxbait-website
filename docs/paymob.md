# Paymob Payment Gateway Integration

This document provides a comprehensive guide for integrating and using Paymob payment gateway in the Doctoory website.

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Integration Flow](#integration-flow)
4. [API Routes](#api-routes)
5. [Database Schema](#database-schema)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

The Paymob integration enables online card payments for the Doctoory e-commerce store. The integration uses:

- **Payment Flow**: Redirect to Paymob hosted payment page
- **Payment Methods**: Card payments (Visa, Mastercard, etc.)
- **Security**: HMAC signature verification for callbacks
- **Currency**: Egyptian Pounds (EGP)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Paymob API Credentials
PAYMOB_API_KEY=your_api_key_here
PAYMOB_PUBLIC_KEY=your_public_key_here
PAYMOB_SECRET_KEY=your_secret_key_here
PAYMOB_INTEGRATION_ID=your_integration_id_here

# Site URL (for callbacks)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Getting Your Credentials

1. **Sign up** for a Paymob account at [https://accept.paymob.com](https://accept.paymob.com)
2. **Navigate** to Settings > Account Info
3. **Copy** your API Key, Public Key, and Secret Key
4. **Navigate** to Settings > Payment Integrations
5. **Copy** your Card Payment Integration ID

### Test Credentials

For testing, use Paymob's sandbox environment:

- **Test Card**: 4987654321098769
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **OTP**: 123456

## Integration Flow

### 1. User Checkout

1. User adds products to cart
2. User proceeds to checkout
3. User selects "Online Payment" as payment method
4. User clicks "Place Order"

### 2. Order Creation

1. System creates order in database with `payment_status: "pending"`
2. System calls `/api/payments/paymob/create-intention`
3. API authenticates with Paymob
4. API creates Paymob order
5. API generates payment key
6. System redirects user to Paymob payment page

### 3. Payment Processing

1. User enters card details on Paymob page
2. Paymob processes payment
3. Paymob redirects to callback URL with transaction details

### 4. Callback Handling

1. System receives callback at `/api/payments/paymob/callback`
2. System verifies HMAC signature
3. System updates order status based on payment result
4. System clears user's cart if payment successful
5. System redirects user to store with success/failure message

## API Routes

### Create Payment Intention

**Endpoint**: `POST /api/payments/paymob/create-intention`

**Request Body**:

```json
{
	"order_id": 123
}
```

**Response**:

```json
{
	"success": true,
	"payment_url": "https://accept.paymob.com/api/acceptance/iframes/...",
	"paymob_order_id": 123456
}
```

### Payment Callback

**Endpoint**: `GET /api/payments/paymob/callback`

**Query Parameters**: Sent by Paymob, includes transaction details and HMAC signature

**Response**: Redirects to store with status query parameters

### Verify Transaction

**Endpoint**: `POST /api/payments/paymob/verify`

**Request Body**:

```json
{
	"order_id": 123
}
```

or

```json
{
	"transaction_id": "123456"
}
```

**Response**:

```json
{
	"success": true,
	"transaction": {
		"id": 123456,
		"success": true,
		"pending": false,
		"amount_cents": 100000,
		"currency": "EGP"
	},
	"order": {
		"id": 123,
		"payment_status": "paid",
		"order_status": "confirmed"
	}
}
```

## Database Schema

### Orders Table

The following fields were added to support Paymob integration:

```sql
-- Paymob payment tracking fields
paymob_order_id TEXT NULL,
paymob_transaction_id TEXT NULL,
paymob_payment_key TEXT NULL
```

### Migration

To add these fields to your existing database, run:

```sql
ALTER TABLE orders
ADD COLUMN paymob_order_id TEXT,
ADD COLUMN paymob_transaction_id TEXT,
ADD COLUMN paymob_payment_key TEXT;
```

## Testing

### Local Testing

1. Start your development server: `npm run dev`
2. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`
3. Use Paymob test credentials
4. Place a test order with online payment
5. Use test card details on Paymob page

### Testing Scenarios

- ✅ **Successful Payment**: Use test card, complete payment
- ❌ **Failed Payment**: Cancel payment or use invalid card
- ⏳ **Pending Payment**: Test with specific test cards that trigger pending status

### Callback Testing

Paymob will call your callback URL. For local testing:

1. Use a tunneling service like ngrok: `ngrok http 3000`
2. Update callback URL in Paymob dashboard to ngrok URL
3. Test the complete flow

## Troubleshooting

### Common Issues

#### 1. "Failed to authenticate with Paymob"

**Solution**: Check your `PAYMOB_API_KEY` is correct and not expired.

#### 2. "Invalid HMAC signature"

**Solution**: Verify your `PAYMOB_SECRET_KEY` matches your Paymob account.

#### 3. "Order not found" in callback

**Solution**: Ensure the order was created successfully before payment intention.

#### 4. Payment successful but order not updated

**Solution**:

- Check server logs for callback errors
- Manually verify transaction using `/api/payments/paymob/verify`
- Ensure callback URL is accessible from internet

### Debug Mode

Enable detailed logging by checking:

```typescript
// In API routes, logs are prefixed with:
console.log("[Paymob Intention]", ...);
console.log("[Paymob Callback]", ...);
console.log("[Paymob Verify]", ...);
```

### HMAC Verification

The HMAC is calculated using these fields in order:

```javascript
[
	amount_cents,
	created_at,
	currency,
	error_occured,
	has_parent_transaction,
	id,
	integration_id,
	is_3d_secure,
	is_auth,
	is_capture,
	is_refunded,
	is_standalone_payment,
	is_voided,
	order.id,
	owner,
	pending,
	source_data.pan,
	source_data.sub_type,
	source_data.type,
	success,
];
```

## Security Best Practices

1. **Never expose** `PAYMOB_SECRET_KEY` to client-side code
2. **Always verify** HMAC signatures on callbacks
3. **Use HTTPS** in production for callback URLs
4. **Validate** order ownership before processing payments
5. **Log** all payment transactions for audit trails
6. **Handle** payment timeouts and failures gracefully
7. **Implement** idempotency for callback handling

## Support

For Paymob-specific issues:

- **Documentation**: [https://developers.paymob.com/egypt](https://developers.paymob.com/egypt)
- **Support**: Contact Paymob support team

For integration issues:

- Check server logs
- Review API responses
- Test with sandbox credentials first
