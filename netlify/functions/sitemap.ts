import { Handler } from '@netlify/functions'
import { Database } from './lib/database'

export const handler: Handler = async (event, context) => {
  try {
    const db = new Database()
    const products = await db.findProducts({ isActive: true });
    const baseUrl = 'https://willowbrooks.in';

    // Static routes
    const staticRoutes = [
      '/',
      '/products',
      '/brand-story',
      '/login',
      '/register',
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static routes
    for (const route of staticRoutes) {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}${route}</loc>\n`;
      sitemap += `    <changefreq>daily</changefreq>\n`;
      sitemap += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
      sitemap += `  </url>\n`;
    }

    // Add dynamic product routes
    for (const product of products) {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/products/${product.id}</loc>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.9</priority>\n`;
      sitemap += `  </url>\n`;
    }

    sitemap += `</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
      body: sitemap,
    }
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return {
      statusCode: 500,
      body: 'Failed to generate sitemap',
    }
  }
}
