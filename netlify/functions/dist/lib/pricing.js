"use strict";
/**
 * Pricing Constants for Server-side
 * Centralized pricing configuration to ensure consistency between client and server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderTotal = exports.calculateCustomizationPrice = exports.PRICING = void 0;
exports.PRICING = {
    // Customization add-ons
    EMBROIDERY_COST: 1245.00, // ₹1,245 (15 USD * 83)
    LOGO_COST: 830.00, // ₹830 (10 USD * 83)
    // Shipping
    STANDARD_SHIPPING: 829.00, // ₹829 (9.99 USD * 83)
    // Tax rates (GST in India)
    TAX_RATE: 0.18, // 18% GST
};
const calculateCustomizationPrice = (basePrice, hasEmbroidery = false, hasLogo = false) => {
    let total = basePrice;
    if (hasEmbroidery)
        total += exports.PRICING.EMBROIDERY_COST;
    if (hasLogo)
        total += exports.PRICING.LOGO_COST;
    return total;
};
exports.calculateCustomizationPrice = calculateCustomizationPrice;
const calculateOrderTotal = (subtotal, includeShipping = true, includeTax = false) => {
    let total = subtotal;
    if (includeShipping)
        total += exports.PRICING.STANDARD_SHIPPING;
    if (includeTax)
        total += subtotal * exports.PRICING.TAX_RATE;
    return total;
};
exports.calculateOrderTotal = calculateOrderTotal;
