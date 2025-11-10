/**
 * Instagram Integration Utilities
 * Handles Instagram DM links and message formatting
 */

export interface OrderDetails {
  orderId: string
  productId: string
  productName: string
  size: string
  color: string
  embroidery?: string
  price: number
  customerName: string
  shippingAddress: string
}

/**
 * Generate Instagram DM link with pre-filled order message
 */
export const generateInstagramDMLink = (orderDetails: OrderDetails): string => {
  const instagramUsername = import.meta.env.VITE_INSTAGRAM_BUSINESS_USERNAME || 'willowbrook_clothing'

  const message = formatOrderMessage(orderDetails)
  const encodedMessage = encodeURIComponent(message)

  // Instagram DM link format
  // Note: This opens Instagram app on mobile, web on desktop
  return `https://ig.me/m/${instagramUsername}?text=${encodedMessage}`
}

/**
 * Format order details into Instagram message
 */
export const formatOrderMessage = (orderDetails: OrderDetails): string => {
  const businessName = import.meta.env.VITE_BUSINESS_NAME || 'Willowbrook Clothing'
  const siteUrl = import.meta.env.VITE_APP_URL || window.location.origin

  let message = `Hi ${businessName}! 👋\n\n`
  message += `I'd like to place an order:\n\n`
  message += `📦 Order Details:\n`
  message += `Order ID: #${orderDetails.orderId}\n`
  message += `Product: ${orderDetails.productName}\n`
  message += `Size: ${orderDetails.size}\n`
  message += `Color: ${orderDetails.color}\n`

  if (orderDetails.embroidery) {
    message += `Embroidery: "${orderDetails.embroidery}"\n`
  }

  message += `\n💰 Total: ₹${orderDetails.price.toFixed(2)}\n\n`
  message += `🔗 Product Link:\n${siteUrl}/products/${orderDetails.productId}\n\n`
  message += `📍 Shipping To:\n${orderDetails.customerName}\n${orderDetails.shippingAddress}\n\n`
  message += `Please confirm my order and share payment details. Thank you! 🙏`

  return message
}

/**
 * Get Instagram profile URL
 */
export const getInstagramProfileUrl = (): string => {
  const instagramUsername = import.meta.env.VITE_INSTAGRAM_BUSINESS_USERNAME || 'willowbrook_clothing'
  return `https://www.instagram.com/${instagramUsername}/`
}

/**
 * Open Instagram DM in new window/tab
 */
export const openInstagramDM = (orderDetails: OrderDetails): void => {
  const dmLink = generateInstagramDMLink(orderDetails)

  // Try to open in new window
  // On mobile, this will open the Instagram app
  // On desktop, this will open Instagram web
  window.open(dmLink, '_blank')
}

/**
 * Generate DTDC tracking URL
 */
export const generateDTDCTrackingUrl = (trackingCode: string): string => {
  return `https://www.dtdc.in/tracking.asp?strCnno=${trackingCode}&action=track`
}

/**
 * Check if user is on mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Generate WhatsApp message link with pre-filled order message
 */
export const generateWhatsAppLink = (orderDetails: OrderDetails): string => {
  // Get WhatsApp number from environment (format: country code + number, no + or spaces)
  // Example: 919876543210 for India
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || ''

  const message = formatOrderMessage(orderDetails)
  const encodedMessage = encodeURIComponent(message)

  // WhatsApp link format
  // Works on both mobile (opens app) and desktop (opens WhatsApp Web)
  if (whatsappNumber) {
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
  } else {
    // If no number configured, just encode the message for manual sharing
    return `https://wa.me/?text=${encodedMessage}`
  }
}

/**
 * Open WhatsApp chat in new window/tab
 */
export const openWhatsApp = (orderDetails: OrderDetails): void => {
  const whatsappLink = generateWhatsAppLink(orderDetails)

  // Try to open in new window
  // On mobile, this will open the WhatsApp app
  // On desktop, this will open WhatsApp Web
  window.open(whatsappLink, '_blank')
}
