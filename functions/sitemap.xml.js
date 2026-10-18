// Dynamic sitemap.xml — homepage + product deep-links (?p=ID), built from D1.
export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${origin}/`, changefreq: 'daily', priority: '1.0', lastmod: today },
  ];
  try {
    const { results } = await env.DB.prepare('SELECT id FROM products ORDER BY id DESC').all();
    (results || []).forEach((p) => {
      urls.push({ loc: `${origin}/?p=${p.id}`, changefreq: 'weekly', priority: '0.8', lastmod: today });
    });
  } catch { /* DB not bound yet — serve static URLs only */ }

  const escXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${escXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      )
      .join('\n') +
    '\n</urlset>';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
