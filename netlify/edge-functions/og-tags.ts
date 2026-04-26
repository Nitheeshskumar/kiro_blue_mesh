import type { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  // Extract product ID from /products/:id
  const isProductPage = pathParts[1] === 'products';
  const productId = pathParts[2];
  
  // Get the next HTTP response in the chain
  let response = await context.next();

  // If the static file doesn't exist (SPA route fallback), fetch index.html
  if (response.status === 404) {
    response = await context.rewrite("/index.html");
  }

  let html = await response.text();

  if (isProductPage && productId) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}&select=name,description,images`, {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        });

        const data = await res.json();
        
        if (data && data.length > 0) {
          const product = data[0];
          const image = (product.images && product.images.length > 0) ? product.images[0] : 'https://willowbrooks.in/og-image.jpg';
          
          // Replace default tags
          html = html.replace(
            '<meta property="og:title" content="Willowbrook - Premium Mom & Baby Collections" />',
            `<meta property="og:title" content="${product.name} | Willowbrook Customizer" />`
          );
          html = html.replace(
            '<meta property="og:description" content="Create beautiful matching outfits for mom and baby. Premium quality, custom designs, real-time preview." />',
            `<meta property="og:description" content="${product.description || 'Check out this customizable outfit!'}" />`
          );
          html = html.replace(
            '<meta property="og:image" content="https://willowbrook-clothing.netlify.app/og-image.jpg" />',
            `<meta property="og:image" content="${image}" />`
          );
          html = html.replace(
            '<meta property="twitter:title" content="Willowbrook - Premium Mom & Baby Collections" />',
            `<meta property="twitter:title" content="${product.name} | Willowbrook Customizer" />`
          );
          html = html.replace(
            '<meta property="twitter:description" content="Create beautiful matching outfits for mom and baby. Premium quality, custom designs, real-time preview." />',
            `<meta property="twitter:description" content="${product.description || 'Check out this customizable outfit!'}" />`
          );
          html = html.replace(
            '<meta property="twitter:image" content="https://willowbrook-clothing.netlify.app/og-image.jpg" />',
            `<meta property="twitter:image" content="${image}" />`
          );
        }
      } catch (e) {
        console.error("Failed to fetch product for OG tags", e);
      }
    }
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};
