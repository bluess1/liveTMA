import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { blobs } = await list({ prefix: 'meta/' });
    const posts = await Promise.all(
      blobs.map(async (b) => {
        const r = await fetch(b.url);
        return r.json();
      })
    );
    posts.sort((a, b) => b.ts - a.ts);
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    const { caption, type, mediaUrl, mediaPath } = req.body || {};
    if (!caption && !mediaUrl) {
      return res.status(400).json({ error: 'Empty post' });
    }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const post = {
      id,
      caption: caption || '',
      type: type || 'text',
      mediaUrl: mediaUrl || null,
      mediaPath: mediaPath || null,
      ts: Date.now()
    };
    await put(`meta/${id}.json`, JSON.stringify(post), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false
    });
    return res.status(200).json(post);
  }

  if (req.method === 'DELETE') {
    const { id, mediaPath } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    await del(`meta/${id}.json`);
    if (mediaPath) {
      try { await del(mediaPath); } catch (e) {}
    }
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
