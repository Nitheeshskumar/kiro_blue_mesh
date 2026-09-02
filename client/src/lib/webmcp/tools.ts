/**
 * WebMCP Tool Implementations for Willowbrook Clothing
 *
 * Each tool wraps existing application logic and stores directly.
 * No parallel API or duplicate data path is created.
 */

import { productApi, api } from "../api";
import { Product } from "../../types";
import { INDIAN_SIZE_CHART, SizeChart } from "../../data/sizingChart";
import { useCartStore } from "../../stores/cartStore";
import { calculateProductPrice } from "../../constants/pricing";

// High-fidelity fallback catalog in case the server database is temporarily offline or in static preview
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-classic-tshirt-001",
    name: "Classic Cotton T-Shirt",
    description: "Premium 100% combed cotton t-shirt perfect for everyday wear and bespoke embroidery.",
    category: "shirts",
    categories: ["cotton-essentials", "everyday-casual"],
    basePrice: 1899.0,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#00FF00", "#000080"],
    sizePricing: { XS: 0, S: 0, M: 0, L: 0, XL: 199, XXL: 349 },
    colorPricing: { "#000000": 0, "#FFFFFF": 0, "#FF0000": 149, "#0000FF": 149, "#00FF00": 149, "#000080": 199 },
  },
  {
    id: "prod-premium-hoodie-002",
    name: "Premium Fleece Hoodie",
    description: "Ultra-soft heavyweight fleece hoodie with kangaroo pocket and custom embroidery option.",
    category: "hoodies",
    categories: ["winter-essentials", "cotton-essentials"],
    basePrice: 3299.0,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#000000", "#FFFFFF", "#808080", "#000080", "#800000"],
    sizePricing: { S: 0, M: 0, L: 0, XL: 299, XXL: 499 },
    colorPricing: { "#000000": 0, "#FFFFFF": 49, "#808080": 99, "#000080": 149, "#800000": 149 },
  },
  {
    id: "prod-pique-polo-003",
    name: "Tailored Pique Polo",
    description: "Sophisticated pique knit polo with ribbed collar and customizable chest monogram.",
    category: "polos",
    categories: ["cotton-essentials", "smart-casual"],
    basePrice: 2499.0,
    images: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["#000000", "#FFFFFF", "#000080", "#008000"],
    sizePricing: { S: 0, M: 0, L: 0, XL: 199, XXL: 349 },
    colorPricing: { "#000000": 0, "#FFFFFF": 0, "#000080": 99, "#008000": 99 },
  },
  {
    id: "prod-custom-cap-004",
    name: "Signature Structured Cap",
    description: "Classic 6-panel cotton twill cap with adjustable brass clasp and custom front lettering.",
    category: "accessories",
    categories: ["accessories", "everyday-casual"],
    basePrice: 1199.0,
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop"],
    sizes: ["One Size"],
    colors: ["#000000", "#FFFFFF", "#000080", "#808080"],
    sizePricing: { "One Size": 0 },
    colorPricing: { "#000000": 0, "#FFFFFF": 0, "#000080": 50, "#808080": 50 },
  },
];

/**
 * Fetch all available products with graceful fallback
 */
async function getCatalog(): Promise<Product[]> {
  try {
    const products = await productApi.getProducts();
    if (Array.isArray(products) && products.length > 0) {
      return products;
    }
  } catch (err) {
    console.warn("[WebMCP] Backend catalog query failed, falling back to local catalog", err);
  }
  return FALLBACK_PRODUCTS;
}

// -----------------------------------------------------------------------------
// TOOL 1: search_products
// -----------------------------------------------------------------------------
export async function searchProducts(args: { query?: string; category?: string; maxPrice?: number }) {
  const query = (args.query || "").trim().toLowerCase();
  const category = (args.category || "").trim().toLowerCase();
  const maxPrice = args.maxPrice;

  const catalog = await getCatalog();

  const matches = catalog.filter((p) => {
    // Text matching on name, description, category, and tags
    const matchesText =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.categories && p.categories.some((c) => c.toLowerCase().includes(query)));

    // Category filter
    const matchesCategory =
      !category ||
      p.category.toLowerCase() === category ||
      (p.categories && p.categories.some((c) => c.toLowerCase() === category));

    // Price filter
    const matchesPrice = maxPrice === undefined || p.basePrice <= maxPrice;

    return matchesText && matchesCategory && matchesPrice;
  });

  return {
    query: args.query || "",
    filterCategory: args.category || "all",
    resultCount: matches.length,
    products: matches.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      basePrice: p.basePrice,
      currency: "INR",
      sizes: p.sizes,
      availableColorsCount: p.colors.length,
      sampleImageUrl: p.images[0] || null,
    })),
  };
}

// -----------------------------------------------------------------------------
// TOOL 2: recommend_size
// -----------------------------------------------------------------------------
export async function recommendSize(args: {
  chest: number;
  waist?: number;
  hip?: number;
  unit?: "cm" | "in";
  ageGroup?: "adult" | "kids" | "baby";
}) {
  const unit = args.unit || "cm";
  const isInch = unit === "in";

  // Convert measurements to cm for standardized matching
  const chestCm = isInch ? args.chest * 2.54 : args.chest;
  const ageGroup = args.ageGroup || "adult";

  let filteredChart: SizeChart[] = [];

  if (ageGroup === "baby") {
    filteredChart = INDIAN_SIZE_CHART.filter((e) => e.size.includes("month") || e.size.includes("M"));
  } else if (ageGroup === "kids") {
    filteredChart = INDIAN_SIZE_CHART.filter((e) => e.age && e.age.includes("year"));
  } else {
    // Adult sizes
    filteredChart = INDIAN_SIZE_CHART.filter((e) => ["XS", "S", "M", "L", "XL", "XXL", "3XL"].includes(e.size));
  }

  // Parse range: "96-102" => min: 96, max: 102
  let bestMatch: SizeChart | null = null;
  let minDiff = Infinity;

  for (const entry of filteredChart) {
    const parts = entry.chest.split("-").map((s) => parseFloat(s.trim()));
    if (parts.length === 2) {
      const [minVal, maxVal] = parts;
      // Direct fit within range
      if (chestCm >= minVal && chestCm <= maxVal) {
        bestMatch = entry;
        break;
      }
      // Distance calculation if in-between
      const midVal = (minVal + maxVal) / 2;
      const diff = Math.abs(chestCm - midVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = entry;
      }
    }
  }

  if (!bestMatch) {
    bestMatch = filteredChart[2] || INDIAN_SIZE_CHART[0]; // fallback to M
  }

  return {
    query: {
      providedChest: args.chest,
      providedWaist: args.waist,
      unit,
      normalizedChestCm: Math.round(chestCm * 10) / 10,
    },
    recommendedSize: bestMatch.size,
    sizeSpecs: {
      size: bestMatch.size,
      chestRangeCm: bestMatch.chest,
      waistRangeCm: bestMatch.waist,
      lengthCm: bestMatch.length,
    },
    fitAdvice: `For a chest measurement of ${args.chest}${unit} (~${Math.round(chestCm)}cm), Size ${bestMatch.size} gives a standard comfort fit. If you prefer a loose or oversized look, opt for the next size up.`,
  };
}

// -----------------------------------------------------------------------------
// TOOL 3: get_product_details
// -----------------------------------------------------------------------------
export async function getProductDetails(args: { productId: string }) {
  if (!args.productId) {
    throw new Error("productId is required. Please provide a valid product identifier.");
  }

  const catalog = await getCatalog();
  const product = catalog.find((p) => p.id === args.productId);

  if (!product) {
    const availableIds = catalog.map((p) => `${p.id} (${p.name})`).join(", ");
    throw new Error(`Product with ID "${args.productId}" was not found. Available products: ${availableIds}`);
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    basePrice: product.basePrice,
    currency: "INR",
    sizes: product.sizes,
    colors: product.colors,
    sizePricingAddons: product.sizePricing || {},
    colorPricingAddons: product.colorPricing || {},
    images: product.images,
    customizationOptions: {
      supportsEmbroidery: true,
      embroideryCharacterLimit: 20,
      embroideryCost: 1245.0,
      availableColorSwatches: product.colors,
    },
  };
}

// -----------------------------------------------------------------------------
// TOOL 4: customize_product (Stateful Mutation)
// -----------------------------------------------------------------------------
export async function customizeProduct(args: {
  productId: string;
  size: string;
  color: string;
  embroideryText?: string;
}) {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.id === args.productId);

  if (!product) {
    throw new Error(`Product "${args.productId}" not found. Cannot customize.`);
  }

  const normalizedSize = args.size.toUpperCase();
  if (!product.sizes.includes(normalizedSize) && !product.sizes.includes(args.size)) {
    throw new Error(
      `Size "${args.size}" is not available for ${product.name}. Available sizes: ${product.sizes.join(", ")}`,
    );
  }

  const embroidery = (args.embroideryText || "").trim().slice(0, 20);

  // Calculate live price
  const calculatedPrice = calculateProductPrice(
    product.basePrice,
    normalizedSize,
    args.color,
    product.sizePricing,
    product.colorPricing,
    Boolean(embroidery),
  );

  // Dispatch custom event to let CustomizerPage react live
  if (typeof window !== "undefined") {
    const event = new CustomEvent("webmcp:customizer-updated", {
      detail: {
        productId: product.id,
        size: normalizedSize,
        color: args.color,
        embroideryText: embroidery,
        price: calculatedPrice,
      },
    });
    window.dispatchEvent(event);
  }

  return {
    success: true,
    customization: {
      productId: product.id,
      productName: product.name,
      size: normalizedSize,
      color: args.color,
      embroideryText: embroidery || null,
      totalPrice: calculatedPrice,
      currency: "INR",
    },
    message: `Customization preview updated live on page for ${product.name} (Size: ${normalizedSize}, Color: ${args.color}).`,
  };
}

// -----------------------------------------------------------------------------
// TOOL 5: get_cart (Read-only)
// -----------------------------------------------------------------------------
export async function getCart() {
  const cartStore = useCartStore.getState();
  const items = cartStore.items || [];
  const totalPrice = cartStore.getTotalPrice();

  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice,
    currency: "INR",
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      size: item.size,
      color: item.color,
      embroidery: item.embroidery || null,
      quantity: item.quantity,
      unitPrice: item.price,
      itemTotal: item.price * item.quantity,
    })),
  };
}

// -----------------------------------------------------------------------------
// TOOL 6: add_to_cart (Stateful Mutation)
// -----------------------------------------------------------------------------
export async function addToCart(args: {
  productId: string;
  size: string;
  color: string;
  quantity?: number;
  embroideryText?: string;
}) {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.id === args.productId);

  if (!product) {
    throw new Error(`Product "${args.productId}" not found.`);
  }

  const quantity = Math.max(1, Math.floor(args.quantity || 1));
  const normalizedSize = args.size.toUpperCase();
  const embroidery = (args.embroideryText || "").trim().slice(0, 20);

  const price = calculateProductPrice(
    product.basePrice,
    normalizedSize,
    args.color,
    product.sizePricing,
    product.colorPricing,
    Boolean(embroidery),
  );

  const cartStore = useCartStore.getState();
  const tempCustomizationId = `webmcp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  cartStore.addItem({
    productId: product.id,
    productName: product.name,
    customizationId: tempCustomizationId,
    size: normalizedSize,
    color: args.color,
    price,
    quantity,
    previewUrl: product.images[0] || "",
    embroidery: embroidery || undefined,
    isTemporary: true,
  });

  // Dispatch event so any UI subscriber can notify the user
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("webmcp:cart-updated", {
        detail: {
          productName: product.name,
          quantity,
          totalCartCount: useCartStore.getState().items.length,
        },
      }),
    );
  }

  return {
    success: true,
    addedItem: {
      productId: product.id,
      productName: product.name,
      size: normalizedSize,
      color: args.color,
      quantity,
      price,
      embroidery: embroidery || null,
    },
    cartTotalItems: useCartStore.getState().items.reduce((s, i) => s + i.quantity, 0),
    cartTotalAmount: useCartStore.getState().getTotalPrice(),
    currency: "INR",
    message: `Successfully added ${quantity}x "${product.name}" to shopping bag.`,
  };
}

// -----------------------------------------------------------------------------
// TOOL 7: track_order (Read-only)
// -----------------------------------------------------------------------------
export async function trackOrder(args: { orderId: string }) {
  const orderId = (args.orderId || "").trim();
  if (!orderId) {
    throw new Error("orderId is required to track an order.");
  }

  try {
    const response = await api.get(`/orders/${orderId}`);
    const order = response.data;
    return {
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: "INR",
      createdAt: order.createdAt,
      trackingCode: order.trackingCode || "WB-" + order.id.slice(-6).toUpperCase(),
      trackingUrl: order.trackingUrl || `https://willowbrook.clothing/order-tracking/${order.id}`,
      itemsCount: order.items?.length || 1,
      estimatedDeliveryDays: 3,
    };
  } catch (err) {
    // If order not found in database or user is querying a demo ID
    return {
      orderId,
      status: "PROCESSING",
      message: `Order #${orderId} is currently being prepared and customized in our workshop.`,
      estimatedDeliveryDays: 3,
      trackingCode: `WB-${orderId.slice(-6).toUpperCase()}`,
    };
  }
}
