/**
 * WebMCP (Web Model Context Protocol) Integration for Willowbrook Clothing
 *
 * Exposes structured tools to AI agents running in ChatGPT in-app browser
 * or Google Chrome with WebMCP enabled (chrome://flags/#enable-webmcp-testing).
 *
 * Spec compliance:
 * - document.modelContext.registerTool(definition, { signal })
 * - Strict JSON Schema inputSchema
 * - annotations.readOnlyHint: true for read operations, omitted for mutations
 * - AbortController cleanup lifecycle
 * - Progressive enhancement: 100% non-blocking for standard browsers
 */

import {
  searchProducts,
  recommendSize,
  getProductDetails,
  customizeProduct,
  getCart,
  addToCart,
  trackOrder,
} from "./tools";

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (args: any) => Promise<any>;
  annotations?: {
    readOnlyHint?: boolean;
  };
}

/**
 * The 7 WebMCP Tools exposed by Willowbrook Clothing
 */
export const WEBMCP_TOOLS: WebMCPToolDefinition[] = [
  // 1. search_products (Read-Only)
  {
    name: "search_products",
    description:
      "Search the Willowbrook Clothing catalog by keyword, apparel category, or maximum price. Returns matching products with sizing and pricing info.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            'Keyword to search for, e.g. "hoodie", "cotton", "polo", "t-shirt". Pass a concise search term rather than a full sentence.',
        },
        category: {
          type: "string",
          description: 'Optional category filter: "shirts", "hoodies", "polos", or "accessories".',
        },
        maxPrice: {
          type: "number",
          description: "Optional maximum price in INR (e.g. 2500).",
        },
      },
    },
    execute: searchProducts,
    annotations: {
      readOnlyHint: true,
    },
  },

  // 2. recommend_size (Read-Only)
  {
    name: "recommend_size",
    description:
      "Match customer body measurements to the exact garment size from the official Willowbrook sizing chart. Eliminates sizing doubt and returns.",
    inputSchema: {
      type: "object",
      properties: {
        chest: {
          type: "number",
          description: "Chest measurement (e.g. 98 or 38).",
        },
        waist: {
          type: "number",
          description: "Optional waist measurement.",
        },
        unit: {
          type: "string",
          enum: ["cm", "in"],
          description: 'Measurement unit: "cm" for centimeters (default) or "in" for inches.',
        },
        ageGroup: {
          type: "string",
          enum: ["adult", "kids", "baby"],
          description: 'Target age group: "adult" (default), "kids", or "baby".',
        },
      },
      required: ["chest"],
    },
    execute: recommendSize,
    annotations: {
      readOnlyHint: true,
    },
  },

  // 3. get_product_details (Read-Only)
  {
    name: "get_product_details",
    description:
      "Retrieve detailed product specs, customization rules, fabric details, size chart, and available color hex swatches for a given product ID.",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: 'The unique product identifier, e.g. "prod-classic-tshirt-001".',
        },
      },
      required: ["productId"],
    },
    execute: getProductDetails,
    annotations: {
      readOnlyHint: true,
    },
  },

  // 4. customize_product (Stateful - Side Effect)
  {
    name: "customize_product",
    description:
      "Configure bespoke garment attributes (color, size, custom embroidery text). Live-updates the interactive customizer on the user's screen with instant price calculation.",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: 'The ID of the product being customized, e.g. "prod-classic-tshirt-001".',
        },
        size: {
          type: "string",
          description: 'Selected garment size, e.g. "M", "L", "XL".',
        },
        color: {
          type: "string",
          description:
            'Selected fabric color hex code (e.g. "#000080" for navy, "#000000" for black, "#FFFFFF" for white) or standard color name.',
        },
        embroideryText: {
          type: "string",
          description: "Optional custom monogram or text to embroider onto the garment (maximum 20 characters).",
        },
      },
      required: ["productId", "size", "color"],
    },
    execute: customizeProduct,
    // Deliberately omit readOnlyHint: signals a side-effect that prompts the agent to confirm changes with user
  },

  // 5. get_cart (Read-Only)
  {
    name: "get_cart",
    description:
      "View current items in the user's shopping bag, including quantities, customized configurations, and total cart value in INR.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    execute: getCart,
    annotations: {
      readOnlyHint: true,
    },
  },

  // 6. add_to_cart (Stateful - Side Effect)
  {
    name: "add_to_cart",
    description:
      "Add a customized or standard apparel item to the active shopping bag. Updates the bag badge and displays a confirmation toast to the human user.",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "The unique product ID to add.",
        },
        size: {
          type: "string",
          description: 'Selected garment size, e.g. "S", "M", "L", "XL".',
        },
        color: {
          type: "string",
          description: 'Selected fabric color hex code (e.g. "#000000", "#FFFFFF", "#000080").',
        },
        quantity: {
          type: "integer",
          description: "Number of units to purchase (default 1).",
        },
        embroideryText: {
          type: "string",
          description: "Optional custom embroidery lettering.",
        },
      },
      required: ["productId", "size", "color"],
    },
    execute: addToCart,
    // Deliberately omit readOnlyHint: committing a purchase action requires explicit human agreement
  },

  // 7. track_order (Read-Only)
  {
    name: "track_order",
    description:
      "Look up live order status, customization milestones, tracking number, and delivery estimates for an existing Willowbrook order.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: 'The order identifier, e.g. "ord-12345".',
        },
      },
      required: ["orderId"],
    },
    execute: trackOrder,
    annotations: {
      readOnlyHint: true,
    },
  },
];

let registrationController: AbortController | null = null;

/**
 * Initializes WebMCP protocol registration.
 * Progressively enhances the application if modelContext is available.
 * Completely non-blocking for standard browsers.
 */
export async function initWebMCP(): Promise<() => void> {
  if (typeof window === "undefined") {
    return () => {};
  }

  // Feature detection for W3C / Chrome WebMCP standard
  const modelContext = (document as any).modelContext ?? (navigator as any).modelContext;

  // Expose tools programmatically on window for DevTools inspection / debugging
  (window as any).__WEBMCP__ = {
    isSupported: Boolean(modelContext && typeof modelContext.registerTool === "function"),
    tools: WEBMCP_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      readOnly: Boolean(t.annotations?.readOnlyHint),
    })),
    executeTool: async (toolName: string, args: any = {}) => {
      const tool = WEBMCP_TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        throw new Error(`Tool "${toolName}" not found. Available tools: ${WEBMCP_TOOLS.map((t) => t.name).join(", ")}`);
      }
      return tool.execute(args);
    },
  };

  if (!modelContext || typeof modelContext.registerTool !== "function") {
    // Normal browser environment without WebMCP flag enabled
    // Silent exit ensures zero overhead and zero interference with regular shoppers
    return () => {};
  }

  // Abort previous registration if re-initializing
  if (registrationController) {
    registrationController.abort();
  }
  registrationController = new AbortController();
  const { signal } = registrationController;

  try {
    for (const tool of WEBMCP_TOOLS) {
      if (signal.aborted) break;

      await modelContext.registerTool(
        {
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          execute: tool.execute,
          ...(tool.annotations ? { annotations: tool.annotations } : {}),
        },
        { signal },
      );
    }

    // Dispatch global event for inspection
    window.dispatchEvent(
      new CustomEvent("webmcp:ready", {
        detail: { registeredCount: WEBMCP_TOOLS.length },
      }),
    );

    console.log(`[WebMCP] Successfully registered ${WEBMCP_TOOLS.length} tools for Willowbrook Clothing`);
  } catch (err) {
    console.warn("[WebMCP] Registration notice:", err);
  }

  return () => {
    if (registrationController) {
      registrationController.abort();
      registrationController = null;
    }
  };
}
