# Currency Standards

## Indian Rupee (INR)

This is an Indian e-commerce site. Always use Indian Rupee (₹) for all currency displays.

### Rules:
- ✅ Use `₹` symbol (Indian Rupee)
- ❌ Never use `$` (US Dollar)
- ✅ Format: `₹1,234.56`
- ✅ Use `.toFixed(2)` for decimal places

### Examples:

**Correct:**
```typescript
<span>₹{price.toFixed(2)}</span>
<p>Total: ₹{totalAmount.toFixed(2)}</p>
```

**Incorrect:**
```typescript
<span>${price.toFixed(2)}</span>  // ❌ Wrong currency
<p>Total: ${totalAmount.toFixed(2)}</p>  // ❌ Wrong currency
```

### Where to Use:
- Product prices
- Cart totals
- Order amounts
- Shipping costs
- All financial displays

### Indian Context:
- Currency: Indian Rupee (INR)
- Symbol: ₹
- Country: India
- Pincode (not ZIP code)
- States: Indian states
- Phone format: +91 (country code)

### Always Remember:
When displaying any monetary value in the UI, use ₹ symbol, not $.
