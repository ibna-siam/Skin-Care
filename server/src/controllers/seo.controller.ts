import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { config } from '../config/env.js';

export async function getSitemapXml(req: Request, res: Response, next: NextFunction) {
  try {
    const baseUrl = (config.clientUrl || 'https://skin-care-client.vercel.app').replace(/\/$/, '');

    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.brand.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/shop', priority: '0.9', changefreq: 'daily' },
      { path: '/skin-guide', priority: '0.8', changefreq: 'weekly' },
      { path: '/track-order', priority: '0.6', changefreq: 'monthly' },
      { path: '/about', priority: '0.5', changefreq: 'monthly' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' },
      { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
      { path: '/terms-conditions', priority: '0.3', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Categories
    for (const cat of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/category/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${cat.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Brands
    for (const brand of brands) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/brand/${brand.slug}</loc>\n`;
      xml += `    <lastmod>${brand.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Products
    for (const prod of products) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product/${prod.slug}</loc>\n`;
      xml += `    <lastmod>${prod.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
}

export function getRobotsTxt(req: Request, res: Response) {
  const baseUrl = (config.clientUrl || 'https://skin-care-client.vercel.app').replace(/\/$/, '');
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /checkout
Disallow: /payment/

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  return res.status(200).send(content);
}
