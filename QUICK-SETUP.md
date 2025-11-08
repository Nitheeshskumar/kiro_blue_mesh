# Quick Setup Guide - Instagram Integration

## ⚡ 5-Minute Setup

### Step 1: Update Instagram Username (REQUIRED)

**File: `.env` (root directory)**
```env
INSTAGRAM_BUSINESS_USERNAME=your_instagram_handle
```

**File: `client/.env`**
```env
VITE_INSTAGRAM_BUSINESS_USERNAME=your_instagram_handle
```

Replace `your_instagram_handle` with your actual Instagram username (without the @ symbol).

Example: If your Instagram is `@willowbrook_clothing`, use `willowbrook_clothing`

---

### Step 2: Start the Development Server

```bash
npm run dev
```

This starts both the client and server.

---

### Step 3: Test the Flow

1. **Browse Products:** Go to http://localhost:8888/products
2. **Customize:** Click on a product → Customize it
3. **Add to Cart:** Add to cart
4. **Checkout:** Enter shipping details → Click "Proceed to Checkout"
5. **Instagram Redirect:** You'll see the confirmation page, then Instagram opens
6. **Check Message:** The Instagram DM should have all order details pre-filled

---

## ✅ Verification Checklist

- [ ] Instagram username updated in both `.env` files
- [ ] Dev server running without errors
- [ ] Can place a test order
- [ ] Instagram DM opens with pre-filled message
- [ ] Order appears in "My Orders" page
- [ ] Order tracking page shows order details

---

## 🎯 What Your Customers Will See

1. **After Checkout:**
   - "Order Placed Successfully!" message
   - Instagram button (auto-clicks after 3 seconds)
   - Order summary

2. **Instagram DM:**
   - Pre-filled message with all order details
   - They just need to tap "Send"

3. **Order Tracking:**
   - Can view order status anytime
   - See status history
   - Track package (when shipped)

---

## 📱 Mobile vs Desktop

### Mobile:
- Instagram **app** opens
- Message is pre-filled
- Customer taps "Send"

### Desktop:
- Instagram **web** opens
- Message is pre-filled
- Customer clicks "Send"

---

## 🚀 Going Live

### Before Deployment:

1. **Update Production Environment Variables** (Netlify):
   ```
   INSTAGRAM_BUSINESS_USERNAME=your_handle
   VITE_INSTAGRAM_BUSINESS_USERNAME=your_handle
   ```

2. **Test on Netlify Deploy Preview:**
   - Place a test order
   - Verify Instagram link works
   - Check on mobile device

3. **Deploy:**
   ```bash
   npm run build:netlify
   git push
   ```

---

## 💬 Your Instagram Workflow

### When You Receive an Order DM:

1. **Read the Message:** All details are there
2. **Confirm Order:** Reply with confirmation
3. **Share Payment:** Send UPI ID or bank details
4. **Wait for Payment:** Customer sends payment
5. **Update Status:** Mark as PAID (via admin dashboard - coming soon)
6. **Ship Order:** Add DTDC tracking code
7. **Update Status:** Mark as SHIPPED
8. **Confirm Delivery:** Mark as DELIVERED

---

## 🎨 Customization Options

### Change Business Name:
**File: `.env`**
```env
BUSINESS_NAME=Your Business Name
```

**File: `client/.env`**
```env
VITE_BUSINESS_NAME=Your Business Name
```

### Change Message Format:
**File: `client/src/lib/instagram.ts`**
Edit the `formatOrderMessage` function.

---

## 🆘 Common Issues

### Issue: Instagram doesn't open
**Solution:** Check username is correct (no @ symbol)

### Issue: Message not pre-filled
**Solution:** Some browsers block URL parameters. Customer can copy-paste from confirmation page.

### Issue: Order not found
**Solution:** Ensure customer is logged in and order was created successfully.

---

## 📞 Need Help?

Check the full guide: `INSTAGRAM-INTEGRATION-GUIDE.md`

---

## 🎉 That's It!

You're ready to start taking orders through Instagram!

Your customers will love the seamless experience. 🚀
